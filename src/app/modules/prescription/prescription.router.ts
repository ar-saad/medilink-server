import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createPrescriptionSchema } from "./prescription.schema";
import { PrescriptionController } from "./prescription.controller";

const router = Router();

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
router.post(
  "/",
  checkAuth(UserRole.DOCTOR),
  validateRequest(createPrescriptionSchema),
  PrescriptionController.createPrescription,
);

export const PrescriptionRouter = router;
