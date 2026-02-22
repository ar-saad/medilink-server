import * as z from "zod";
import { loginUserSchema, registerPatientSchema } from "./auth.schema";

export type TRegisterPatientPayload = z.infer<typeof registerPatientSchema>;

export type TLoginUserPayload = z.infer<typeof loginUserSchema>;
