import * as z from "zod";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "./appointment.schema";

export type TCreateAppointmentPayload = z.infer<typeof createAppointmentSchema>;

export type TUpdateAppointmentStatusPayload = z.infer<
  typeof updateAppointmentStatusSchema
>;
