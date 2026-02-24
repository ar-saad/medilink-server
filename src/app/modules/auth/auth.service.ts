import { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "../../../generated/prisma/enums";
import { env } from "../../config/env";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { TLoginUserPayload, TRegisterPatientPayload } from "./auth.types";

// POST | "/api/v1/auth/register" | Register a new patient
const registerPatient = async (payload: TRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new BadRequestError("Failed to register user");
  }

  try {
    const patient = await prisma.$transaction(async (tx) => {
      const patientTx = await tx.patient.create({
        data: {
          userId: data.user.id,
          name: payload.name,
          email: payload.email,
        },
      });

      return patientTx;
    });

    const tokenCreationPayload = {
      userId: data.user.id,
      name: data.user.name,
      email: data.user.email,
      emailVerified: data.user.emailVerified,
      role: data.user.role,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
    };

    // Generate access token
    const accessToken = tokenUtils.createAccessToken(tokenCreationPayload);

    // Generate refresh token
    const refreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

    return {
      ...data,
      accessToken,
      refreshToken,
      patient,
    };
  } catch (error) {
    console.log("Transaction error: ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });
    throw error;
  }
};

// POST | "/api/v1/auth/login" | Login user
const loginUser = async (payload: TLoginUserPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user.status === UserStatus.BLOCKED) {
    throw new ForbiddenError(
      "Your account has been blocked. Please contact support.",
    );
  }

  if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
    throw new ForbiddenError(
      "Your account has been deleted. Please contact support.",
    );
  }

  const tokenCreationPayload = {
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  };

  // Generate access token
  const accessToken = tokenUtils.createAccessToken(tokenCreationPayload);

  // Generate refresh token
  const refreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

  return { ...data, accessToken, refreshToken };
};

// GET | "/api/v1/auth/me" | Get current user details
const getMe = async (user: TRequestUser) => {
  const result = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          specialties: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
      admin: true,
    },
  });

  if (!result) {
    throw new NotFoundError("User not found");
  }

  return result;
};

// GET | "/api/v1/auth/refresh-token" | Refresh access token
const getNewToken = async (refreshToken: string, sessionToken: string) => {
  // Verify if session token exists and is valid
  const isSessionTokenExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });

  if (!isSessionTokenExists) {
    throw new UnauthorizedError("Invalid session token");
  }

  // Verify refresh token
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    env.JWT_REFRESH_TOKEN_SECRET,
  );

  if (!verifiedRefreshToken.success) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const data = verifiedRefreshToken.data as JwtPayload;

  const tokenCreationPayload = {
    userId: data.user.id,
    name: data.user.name,
    email: data.user.email,
    emailVerified: data.user.emailVerified,
    role: data.user.role,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
  };

  // Generate new access and refresh token
  const newAccessToken = tokenUtils.createAccessToken(tokenCreationPayload);
  const newRefreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

  // Increase validity of current better auth session token
  const updatedSession = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Extend session validity by 24 hours
      updatedAt: new Date(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: updatedSession.token,
  };
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
};
