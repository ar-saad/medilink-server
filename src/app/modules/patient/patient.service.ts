import { NotFoundError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import {
  TUpdatePatientHealthDataPayload,
  TUpdatePatientProfilePayload,
} from "./patient.types";
import { convertToDateTime } from "./patient.utils";

const updateMyProfile = async (
  user: TRequestUser,
  payload: TUpdatePatientProfilePayload,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
    include: {
      patientHealthData: true,
      medicalReports: true,
    },
  });

  if (!patientData) {
    throw new NotFoundError("Patient not found");
  }

  await prisma.$transaction(async (tx) => {
    if (payload.patientInfo) {
      await tx.patient.update({
        where: {
          id: patientData.id,
        },
        data: {
          ...payload.patientInfo,
        },
      });

      if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
        await tx.user.update({
          where: {
            id: patientData.userId,
          },
          data: {
            name: payload.patientInfo.name || patientData.name,
            image: payload.patientInfo.profilePhoto || patientData.profilePhoto,
          },
        });
      }
    }

    if (payload.patientHealthData) {
      const healthDataToSave: TUpdatePatientHealthDataPayload = {
        ...payload.patientHealthData,
      };

      if (payload.patientHealthData.dateOfBirth) {
        healthDataToSave.dateOfBirth = convertToDateTime(
          typeof healthDataToSave.dateOfBirth === "string"
            ? healthDataToSave.dateOfBirth
            : undefined,
        ) as Date;

        await tx.patientHealthData.upsert({
          where: {
            patientId: patientData.id,
          },
          update: healthDataToSave,
          create: {
            patientId: patientData.id,
            ...healthDataToSave,
          },
        });
      }
    }

    if (
      payload.medicalReports &&
      Array.isArray(payload.medicalReports) &&
      payload.medicalReports.length > 0
    ) {
      for (const report of payload.medicalReports) {
        if (report.shouldDelete && report.reportId) {
          await tx.medicalReport.delete({
            where: {
              id: report.reportId,
            },
          });
        } else if (report.reportName && report.reportLink) {
          await tx.medicalReport.create({
            data: {
              patientId: patientData.id,
              reportName: report.reportName,
              reportLink: report.reportLink,
            },
          });
        }
      }
    }
  });

  const result = await prisma.patient.findUnique({
    where: {
      id: patientData.id,
    },
    include: {
      user: true,
      patientHealthData: true,
      medicalReports: true,
    },
  });

  return result;
};

export const PatientService = {
  updateMyProfile,
};
