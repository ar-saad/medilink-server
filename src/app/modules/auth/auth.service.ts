import { UserStatus } from "../../../generated/prisma/enums";
import { BadRequestError, ForbiddenError } from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { TLoginUserPayload, TRegisterPatientPayload } from "./auth.types";

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
    const accessToken = tokenUtils.getAccessToken(tokenCreationPayload);

    // Generate refresh token
    const refreshToken = tokenUtils.getRefreshToken(tokenCreationPayload);

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
  const accessToken = tokenUtils.getAccessToken(tokenCreationPayload);

  // Generate refresh token
  const refreshToken = tokenUtils.getRefreshToken(tokenCreationPayload);

  return { ...data, accessToken, refreshToken };
};

export const AuthService = {
  registerPatient,
  loginUser,
};
