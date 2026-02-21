import * as z from "zod";
import { updateDoctorSchema } from "./doctor.schema";

export type TUpdateDoctorPayload = z.infer<typeof updateDoctorSchema>;
