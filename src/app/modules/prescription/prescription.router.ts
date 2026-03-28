import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPrescriptionSchema } from "./prescription.schema";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

// GET | "/api/v1/prescriptions" | Get all prescriptions (Admin only)
router.get(
  "/",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PrescriptionController.getAllPrescriptions,
);

// GET | "/api/v1/prescriptions/my-prescriptions" | Get prescriptions for the logged-in user (Doctor or Patient)
router.get(
  "/my-prescriptions",
  checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
  PrescriptionController.myPrescriptions,
);

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
router.post(
  "/",
  checkAuth(UserRole.DOCTOR),
  validateRequest(createPrescriptionSchema),
  PrescriptionController.createPrescription,
);

export const PrescriptionRouter = router;
