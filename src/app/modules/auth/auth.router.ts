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
// GET | "/api/v1/auth/refresh-token" | Refresh access token
router.get(
  "/refresh-token",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AuthController.getNewToken,
);

export const AuthRouter = router;
