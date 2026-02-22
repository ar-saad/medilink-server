import * as z from "zod";
import {
  createAdminSchema,
  createDoctorSchema,
  createSuperAdminSchema,
} from "./user.schema";

export type TCreateDoctorPayload = z.infer<typeof createDoctorSchema>;

export type TCreateAdminPayload = z.infer<typeof createAdminSchema>;

export type TCreateSuperAdminPayload = z.infer<typeof createSuperAdminSchema>;
