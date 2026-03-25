import * as z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

export const updatePatientSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(1, "Name cannot be empty")
    .max(100, "Name must be less than 100 characters long")
    .optional(),
  profile: z.url("Profile must be a valid URL").optional(),
  contactNumber: z
    .string("Contact number must be a string")
    .min(1, "Contact Number cannot be empty")
    .max(20, "Contact Number must be less than 20 characters long")
    .optional(),
  address: z
    .string("Address must be a string")
    .min(1, "Address cannot be empty")
    .max(200, "Address must be less than 200 characters long")
    .optional(),
});

export const updatePatientHealthDataSchema = z.object({
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  bloodGroup: z
    .enum([
      BloodGroup.A_POSITIVE,
      BloodGroup.A_NEGATIVE,
      BloodGroup.B_POSITIVE,
      BloodGroup.B_NEGATIVE,
      BloodGroup.AB_POSITIVE,
      BloodGroup.AB_NEGATIVE,
      BloodGroup.O_POSITIVE,
      BloodGroup.O_NEGATIVE,
    ])
    .optional(),
  hasAllergies: z.boolean().optional(),
  hasDiabetes: z.boolean().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  smokingStatus: z.boolean().optional(),
  dietaryPreferences: z.string().optional(),
  pregnancyStatus: z.boolean().optional(),
  mentalHealthHistory: z.string().optional(),
  immunizationStatus: z.string().optional(),
  hasPastSurgeries: z.boolean().optional(),
  recentAnxiety: z.boolean().optional(),
  recentDepression: z.boolean().optional(),
  maritalStatus: z.string().optional(),
});

export const updatePatientMedicalReportSchema = z.object({
  shouldDelete: z.boolean().optional(),
  reportId: z.uuid().optional(),
  reportName: z.string().optional(),
  reportLink: z.url().optional(),
});

export const updatePatientProfileSchema = z.object({
  patientInfo: updatePatientSchema.optional(),
  patientHealthData: updatePatientHealthDataSchema.optional(),
  medicalReports: z
    .array(updatePatientMedicalReportSchema)
    .optional()
    .refine(
      (reports) => {
        if (!reports || reports.length === 0) return true; // If no reports, it's valid

        for (const report of reports) {
          // case 1
          if (report.shouldDelete && !report.reportId) {
            return false;
          }

          // case 2
          if (!report.shouldDelete && report.reportId) {
            return false;
          }

          // Case 3
          if (report.reportName && !report.reportLink) {
            return false;
          }

          // Case 4
          if (!report.reportName && report.reportLink) {
            return false;
          }

          return true;
        }
      },
      {
        message:
          "Invalid medical report data. If shouldDelete is true, reportId must be provided. If reportId is provided, shouldDelete must be true. If reportName is provided, reportLink must also be provided and vice versa.",
      },
    ),
});
