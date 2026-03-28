import * as z from "zod";

export const createPrescriptionSchema = z.object({
  appointmentId: z.string("Appointment ID is required"),
  instructions: z
    .string("Instructions is required")
    .min(1, "Instructions cannot be empty"),
  followUpDate: z.date("Follow-up date must be a valid date"),
});

export const updatePrescriptionSchema = z.object({
  instructions: z
    .string("Instructions is required")
    .min(1, "Instructions cannot be empty")
    .optional(),
  followUpDate: z.date("Follow-up date must be a valid date").optional(),
});
