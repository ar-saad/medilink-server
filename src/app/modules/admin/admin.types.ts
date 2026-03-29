import z from "zod";
import {
  changeUserRoleSchema,
  changeUserStatusSchema,
  updateAdminSchema,
} from "./admin.schema";

export type TUpdateAdminPayload = z.infer<typeof updateAdminSchema>;

export type TChangeUserStatusPayload = z.infer<typeof changeUserStatusSchema>;

export type TChangeUserRolePayload = z.infer<typeof changeUserRoleSchema>;
