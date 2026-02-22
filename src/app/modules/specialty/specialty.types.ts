import * as z from "zod";
import {
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./specialty.schema";

export type TCreateSpecialtyPayload = z.infer<typeof createSpecialtySchema>;

export type TUpdateSpecialtyPayload = z.infer<typeof updateSpecialtySchema>;
