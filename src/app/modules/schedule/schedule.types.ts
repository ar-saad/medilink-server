import * as z from "zod";
import { createScheduleSchema, updateScheduleSchema } from "./schedule.schema";

export type TCreateSchedulePayload = z.infer<typeof createScheduleSchema>;
export type TUpdateSchedulePayload = z.infer<typeof updateScheduleSchema>;
