import * as z from "zod";
import { createScheduleSchema } from "./schedule.schema";

export type TCreateSchedulePayload = z.infer<typeof createScheduleSchema>;
