import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./specialty.schema";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// POST | "/api/v1/specialties" | Create a new specialty
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createSpecialtySchema),
  SpecialtyController.createSpecialty,
);

// GET | "/api/v1/specialties" | Get all specialties
router.get("/", SpecialtyController.getAllSpecialties);

// PATCH | "/api/v1/specialties/:id" | Update a specialty by ID
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateSpecialtySchema),
  SpecialtyController.updateSpecialty,
);

// DELETE | "/api/v1/specialties/:id" | Delete a specialty by ID
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.deleteSpecialty,
);

export const SpecialtyRouter = router;
