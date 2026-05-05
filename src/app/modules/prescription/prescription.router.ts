import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from "./prescription.schema";
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

// GET | "/api/v1/prescriptions/:appointmentId" | Get prescription by appointment ID
router.get(
  "/:appointmentId",
  checkAuth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  PrescriptionController.getPrescriptionByAppointmentId,
);

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
router.post(
  "/",
  checkAuth(UserRole.DOCTOR),
  validateRequest(createPrescriptionSchema),
  PrescriptionController.createPrescription,
);

// PATCH | "/api/v1/prescriptions/:id" | Update prescription instructions or follow-up date (Doctor only)
router.patch(
  "/:id",
  checkAuth(UserRole.DOCTOR),
  validateRequest(updatePrescriptionSchema),
  PrescriptionController.updatePrescription,
);

// DELETE | "/api/v1/prescriptions/:id" | Delete a prescription (Doctor only)
router.delete(
  "/:id",
  checkAuth(UserRole.DOCTOR),
  PrescriptionController.deletePrescription,
);

export const PrescriptionRouter = router;
