import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { AdminController } from "./admin.controller";
import { updateAdminSchema } from "./admin.schema";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// GET | "/api/v1/admins" | Get all admins
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAllAdmins,
);

// PATCH | "/api/v1/admins/change-user-status" | Change user status (BLOCKED or ACTIVE)
router.patch(
  "/change-user-status",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  AdminController.changeUserStatus,
);

// PATCH | "/api/v1/admins/change-user-role" | Change user role (Super Admin only)
router.patch(
  "/change-user-role",
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.changeUserRole,
);

// GET | "/api/v1/admins/:id" | Get admin by ID
router.get(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminController.getAdminById,
);

// PATCH | "/api/v1/admins/:id" | Update admin by ID
router.patch(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }]),
  validateRequest(updateAdminSchema),
  AdminController.updateAdmin,
);

// DELETE | "/api/v1/admins/:id" | Soft delete admin by ID
router.delete(
  "/:id",
  checkAuth(UserRole.SUPER_ADMIN),
  AdminController.deleteAdmin,
);

export const AdminRouter = router;
