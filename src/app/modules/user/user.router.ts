import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createAdminSchema,
  createDoctorSchema,
  createSuperAdminSchema,
} from "./user.schema";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router: Router = Router();

// POST | "/api/v1/users/create-doctor" | Create a new doctor user
router.post(
  "/create-doctor",
  validateRequest(createDoctorSchema),
  UserController.createDoctor,
);
// POST | "/api/v1/users/create-admin" | Create a new admin user (requires SUPER_ADMIN role)
router.post(
  "/create-admin",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(createAdminSchema),
  UserController.createAdmin,
);
// POST | "/api/v1/users/create-super-admin" | Create a new super admin user (requires SUPER_ADMIN role)
router.post(
  "/create-super-admin",
  checkAuth(UserRole.SUPER_ADMIN),
  validateRequest(createSuperAdminSchema),
  UserController.createSuperAdmin,
);

export const UserRouter = router;
