import z from "zod";
import { updateAdminSchema } from "./admin.schema";

export type TUpdateAdminPayload = z.infer<typeof updateAdminSchema>;
