import * as z from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.uuid(),
  scheduleId: z.uuid(),
});

export const updateAppointmentStatusSchema = z.object({
  doctorId: z.uuid().optional(),
  scheduleId: z.uuid().optional(),
  status: z.string().optional(),
});
