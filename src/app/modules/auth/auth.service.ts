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
import {
  TBetterAuthSession,
  TChangePasswordPayload,
  TLoginUserPayload,
  TRegisterPatientPayload,
} from "./auth.types";

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

// POST | "/api/v1/auth/refresh-token" | Refresh access token
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
    userId: data.id,
    name: data.name,
    email: data.email,
    emailVerified: data.emailVerified,
    role: data.role,
    status: data.status,
    isDeleted: data.isDeleted,
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

// POST | "/api/v1/auth/change-password" | Change user password
const changePassword = async (
  payload: TChangePasswordPayload,
  sessionToken: string,
) => {
  const session = await auth.api.getSession({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  if (!session) {
    throw new UnauthorizedError("Invalid session token");
  }

  const { currentPassword, newPassword } = payload;

  const result = await auth.api.changePassword({
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  // Update needPasswordChange field to false after successful password change
  if (session.user.needPasswordChange) {
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        needPasswordChange: false,
      },
    });
  }

  const tokenCreationPayload = {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
  };

  // Generate access token
  const accessToken = tokenUtils.createAccessToken(tokenCreationPayload);

  // Generate refresh token
  const refreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

  return { ...result, accessToken, refreshToken };
};

// POST | "/api/v1/auth/logout" | Logout user from current session
const logoutUser = async (sessionToken: string) => {
  const result = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`,
    }),
  });

  return result;
};

// POST | "/api/v1/auth/verify-email" | Verify user email
const verifyEmail = async (email: string, otp: string) => {
  const result = await auth.api.verifyEmailOTP({
    body: {
      email,
      otp,
    },
  });

  if (result.status && !result.user.emailVerified) {
    await prisma.user.update({
      where: {
        email,
      },
      data: {
        emailVerified: true,
      },
    });
  }
};

// POST | "/api/v1/auth/forget-password" | Send OTP to user email for password reset
const forgetPassword = async (email: string) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Check account status before allowing password reset
  if (!isUserExists) {
    throw new NotFoundError("User with this email does not exist");
  }

  if (!isUserExists.emailVerified) {
    throw new BadRequestError(
      "Email is not verified. Please verify your email first.",
    );
  }

  if (isUserExists.isDeleted || isUserExists.status === UserStatus.BLOCKED) {
    throw new BadRequestError("User account is deleted or inactive.");
  }

  // Send OTP to user email for password reset
  await auth.api.requestPasswordResetEmailOTP({
    body: {
      email,
    },
  });
};

// POST | "/api/v1/auth/reset-password" | Reset user password using OTP
const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // Check account status before allowing password reset
  if (!isUserExists) {
    throw new NotFoundError("User with this email does not exist");
  }

  if (!isUserExists.emailVerified) {
    throw new BadRequestError(
      "Email is not verified. Please verify your email first.",
    );
  }

  if (isUserExists.isDeleted || isUserExists.status === UserStatus.BLOCKED) {
    throw new BadRequestError("User account is deleted or inactive.");
  }

  // Reset password using OTP
  await auth.api.resetPasswordEmailOTP({
    body: {
      email,
      otp,
      password: newPassword,
    },
  });

  // Update needPasswordChange field to false after successful password reset
  await prisma.user.update({
    where: {
      id: isUserExists.id,
    },
    data: {
      needPasswordChange: false,
    },
  });

  // Invalidate all existing sessions for the user after password reset
  await prisma.session.deleteMany({
    where: {
      userId: isUserExists.id,
    },
  });

  // Automatically log the user in after password reset to get new tokens
  const data = await auth.api.signInEmail({
    body: {
      email,
      password: newPassword,
    },
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

  // Generate new access and refresh tokens
  const accessToken = tokenUtils.createAccessToken(tokenCreationPayload);
  const refreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

// POST | "/api/v1/auth/resend-verification-otp" | Resend OTP to user email for verification
const resendVerificationOTP = async (email: string) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!isUserExists) {
    throw new NotFoundError("User with this email does not exist");
  }

  if (isUserExists.emailVerified) {
    throw new BadRequestError("Email is already verified");
  }

  if (isUserExists.isDeleted || isUserExists.status === UserStatus.BLOCKED) {
    throw new BadRequestError("User account is deleted or inactive.");
  }

  // Send verification OTP to user email
  await auth.api.sendVerificationEmail({
    body: {
      email,
    },
  });
};

// GET | "/api/v1/auth/login/google/success" | Create patient after successful Google OAuth login
const googleLoginSuccess = async (session: TBetterAuthSession) => {
  const existingPatient = await prisma.patient.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!existingPatient) {
    await prisma.patient.create({
      data: {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
    });
  }

  const tokenCreationPayload = {
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    role: session.user.role,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
  };

  // Generate access token
  const accessToken = tokenUtils.createAccessToken(tokenCreationPayload);

  // Generate refresh token
  const refreshToken = tokenUtils.createRefreshToken(tokenCreationPayload);

  return { accessToken, refreshToken };
};

export const AuthService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  resendVerificationOTP,
  googleLoginSuccess,
};
