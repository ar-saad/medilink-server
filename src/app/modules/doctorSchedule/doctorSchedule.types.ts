import * as z from "zod";
import {
  createDoctorScheduleSchema,
  updateDoctorScheduleSchema,
} from "./doctorSchedule.schema";

export type TCreateDoctorSchedulePayload = z.infer<
  typeof createDoctorScheduleSchema
>;

export type TUpdateDoctorSchedulePayload = z.infer<
  typeof updateDoctorScheduleSchema
>;
