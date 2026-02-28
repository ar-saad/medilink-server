import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// POST | "/api/v1/auth/register" | Register a new patient
router.post("/register", AuthController.registerPatient);

// POST | "/api/v1/auth/login" | Login user
router.post("/login", AuthController.loginUser);

// GET | "/api/v1/auth/me" | Get current user details
router.get(
  "/me",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.getMe,
);

// POST | "/api/v1/auth/refresh-token" | Refresh access token
router.post("/refresh-token", AuthController.getNewToken);

// POST | "/api/v1/auth/change-password" | Change user password
router.post(
  "/change-password",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.changePassword,
);

// POST | "/api/v1/auth/logout" | Logout user from current session
router.post(
  "/logout",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.logoutUser,
);

// POST | "/api/v1/auth/verify-email" | Verify user email
router.post("/verify-email", AuthController.verifyEmail);

// POST | "/api/v1/auth/forget-password" | Send OTP to user email for password reset
router.post("/forget-password", AuthController.forgetPassword);

// POST | "/api/v1/auth/reset-password" | Reset user password using OTP
router.post("/reset-password", AuthController.resetPassword);

// GET | "/api/v1/auth/login/google" | Google OAuth login
router.get("/login/google", AuthController.googleLogin);

// GET | "/api/v1/auth/login/google/success" | Create patient after successful Google OAuth login
router.get("/login/google/success", AuthController.googleLoginSuccess);

// GET | "/api/v1/auth/oauth/error" | Handle Google OAuth login failure
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRouter = router;
