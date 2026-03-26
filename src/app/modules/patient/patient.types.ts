import { BloodGroup, Gender } from "../../../generated/prisma/enums";

export type TUpdatePatientInfoPayload = {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
};

export type TUpdatePatientHealthDataPayload = {
  gender: Gender;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  hasAllergies: boolean;
  hasDiabetes: boolean;
  height: string;
  weight: string;
  smokingStatus: boolean;
  dietaryPreference?: string;
  pregnancyStatus: boolean;
  mentalHealthHistory?: string;
  immunizationStatus?: string;
  hasPastSurgeries: boolean;
  recentAnxiety: boolean;
  recentDepression: boolean;
  maritalStatus?: string;
};

export type TUpdatePatientMedicalReportPayload = {
  reportName?: string;
  reportLink?: string;
  shouldDelete?: boolean;
  reportId?: string;
};

export type TUpdatePatientProfilePayload = {
  patientInfo?: TUpdatePatientInfoPayload;
  patientHealthData?: TUpdatePatientHealthDataPayload;
  medicalReports?: TUpdatePatientMedicalReportPayload[];
};
