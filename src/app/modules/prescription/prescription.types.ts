import * as z from "zod";
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from "./prescription.schema";

export type TCreatePrescriptionPayload = z.infer<
  typeof createPrescriptionSchema
>;

export type TUpdatePrescriptionPayload = z.infer<
  typeof updatePrescriptionSchema
>;
