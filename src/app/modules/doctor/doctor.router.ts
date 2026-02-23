import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateDoctorSchema } from "./doctor.schema";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router: Router = Router();

// GET | "/api/v1/doctors" | Get all doctors
router.get(
  "/",
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorController.getAllDoctors,
);
// GET | "/api/v1/doctors/:id" | Get doctor by ID
router.get(
  "/:id",
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorController.getDoctorById,
);
// PATCH | "/api/v1/doctors/:id" | Update doctor by ID
router.patch(
  "/:id",
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateDoctorSchema),
  DoctorController.updateDoctor,
);
// DELETE | "/api/v1/doctors/:id" | Soft delete doctor by ID
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorController.deleteDoctor,
);

export const DoctorRouter = router;
