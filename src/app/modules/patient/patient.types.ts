import * as z from "zod";
import {
  updatePatientHealthDataSchema,
  updatePatientMedicalReportSchema,
  updatePatientProfileSchema,
  updatePatientSchema,
} from "./patient.schema";

export type TUpdatePatientPayload = z.infer<typeof updatePatientSchema>;

export type TUpdatePatientHealthDataPayload = z.infer<
  typeof updatePatientHealthDataSchema
>;

export type TUpdatePatientMedicalReportPayload = z.infer<
  typeof updatePatientMedicalReportSchema
>;

export type TUpdatePatientProfilePayload = z.infer<
  typeof updatePatientProfileSchema
>;
