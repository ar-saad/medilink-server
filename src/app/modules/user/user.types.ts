import * as z from "zod";
import { createDoctorSchema } from "./user.schema";

export type TCreateDoctorPayload = z.infer<typeof createDoctorSchema>;
