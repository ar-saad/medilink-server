import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";

// POST | "/api/v1/auth/register" | Register a new patient
const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await AuthService.registerPatient({
    name,
    email,
    password,
  });

  const { accessToken, refreshToken, token, ...rest } = result;

  // Set tokens in cookie
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message:
      "Patient registered successfully. Please verify your email to activate your account.",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

// POST | "/api/v1/auth/login" | Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.loginUser({
    email,
    password,
  });

  const { accessToken, refreshToken, token, ...rest } = result;

  // Set tokens in cookie
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

// GET | "/api/v1/auth/me" | Get current user details
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  const result = await AuthService.getMe(user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User details retrieved successfully",
    data: result,
  });
});

// POST | "/api/v1/auth/refresh-token" | Refresh access token
const getNewToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  const sessionToken = req.cookies["better-auth.session_token"];

  if (!refreshToken || !sessionToken) {
    return sendResponse(res, {
      statusCode: status.UNAUTHORIZED,
      success: false,
      message: "Refresh token or session token is missing",
    });
  }

  const result = await AuthService.getNewToken(refreshToken, sessionToken);

  const {
    accessToken,
    refreshToken: newRefreshToken,
    sessionToken: newSessionToken,
  } = result;

  // Set tokens in cookie
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, newSessionToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "New access token generated successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
      sessionToken: newSessionToken,
    },
  });
});

// POST | "/api/v1/auth/change-password" | Change user password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const sessionToken = req.cookies["better-auth.session_token"];

  const result = await AuthService.changePassword(
    {
      currentPassword,
      newPassword,
    },
    sessionToken,
  );

  const { accessToken, refreshToken, token, ...rest } = result;

  // Set tokens in cookie
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

// POST | "/api/v1/auth/logout" | Logout user from current session
const logoutUser = asyncHandler(async (req, res) => {
  const sessionToken = req.cookies["better-auth.session_token"];

  const result = await AuthService.logoutUser(sessionToken);

  // Clear tokens from cookie
  cookieUtils.clearCookie(res, "accessToken");
  cookieUtils.clearCookie(res, "refreshToken");
  cookieUtils.clearCookie(res, "better-auth.session_token");

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: result,
  });
});

// POST | "/api/v1/auth/verify-email" | Verify user email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
};
