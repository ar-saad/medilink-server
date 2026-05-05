import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";
import { env } from "../../config/env";
import { auth } from "../../lib/auth";

// POST | "/api/v1/auth/register" | Register a new patient
const registerPatient = asyncHandler(async (req: Request, res: Response) => {
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
const loginUser = asyncHandler(async (req: Request, res: Response) => {
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
const getMe = asyncHandler(async (req: Request, res: Response) => {
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
const getNewToken = asyncHandler(async (req: Request, res: Response) => {
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
const changePassword = asyncHandler(async (req: Request, res: Response) => {
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
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
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
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Email verified successfully",
  });
});

// POST | "/api/v1/auth/forget-password" | Send OTP to user email for password reset
const forgetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.forgetPassword(email);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset OTP sent to email successfully",
  });
});

// POST | "/api/v1/auth/reset-password" | Reset user password using OTP
const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  await AuthService.resetPassword(email, otp, newPassword);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password reset successfully",
  });
});

// GET | "/api/v1/auth/login/google" | Google OAuth login
const googleLogin = asyncHandler(async (req: Request, res: Response) => {
  // /api/v1/auth/login/google?redirect=/profile -> redirect to /profile after successful login
  const redirectPath = req.query.redirect || "/dashboard";

  // Encode the redirect path to ensure it's safely included in the URL
  const encodedRedirectPath = encodeURIComponent(redirectPath as string);

  // Construct the callback URL that better-auth will redirect to after successful Google OAuth login
  const callbackURL = `${env.BETTER_AUTH_URL}/api/v1/auth/login/google/success?redirect=${encodedRedirectPath}`;

  // Render the EJS template and pass the callback URL and better-auth URL as variables
  res.render("googleRedirect", {
    callbackURL: callbackURL,
    betterAuthURL: env.BETTER_AUTH_URL,
  });
});

// GET | "/api/v1/auth/login/google/success" | Create patient after successful Google OAuth login
const googleLoginSuccess = asyncHandler(async (req: Request, res: Response) => {
  // Get the redirect path again from query params (sent by better-auth after successful login)
  const redirectPath = (req.query.redirect as string) || "/dashboard";

  const sessionToken =
    req.cookies["better-auth.session_token"] ||
    req.cookies["__Secure-better-auth.session_token"];

  if (!sessionToken) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }

  const session = await auth.api.getSession({
    headers: {
      Cookie: `better-auth.session_token=${sessionToken}`,
    },
  });

  if (!session) {
    return res.redirect(`${env.FRONTEND_URL}/login?error=no_session_found`);
  }

  if (session && !session.user) {
    if (!sessionToken) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=no_user_found`);
    }
  }

  const result = await AuthService.googleLoginSuccess(session);

  const { accessToken, refreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");

  const finalRedirectURL = isValidRedirectPath ? redirectPath : "/dashboard";

  res.redirect(`${env.FRONTEND_URL}${finalRedirectURL}`);
});

// GET | "/api/v1/auth/oauth/error" | Handle Google OAuth login failure
const handleOAuthError = asyncHandler(async (req: Request, res: Response) => {
  const error = req.query.error || "Error occurred during OAuth login";

  res.redirect(`${env.FRONTEND_URL}/login?error=${error}`);
});

export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logoutUser,
  verifyEmail,
  forgetPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,
};
