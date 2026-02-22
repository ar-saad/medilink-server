import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./specialty.schema";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createSpecialtySchema),
  SpecialtyController.createSpecialty,
);

router.get("/", SpecialtyController.getAllSpecialties);

router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateSpecialtySchema),
  SpecialtyController.updateSpecialty,
);

router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SpecialtyController.deleteSpecialty,
);

export const SpecialtyRouter = router;
