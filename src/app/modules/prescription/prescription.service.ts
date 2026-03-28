import { UserRole } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { sendEmail } from "../../utils/email";
import { TCreatePrescriptionPayload } from "./prescription.types";
import { generatePrescriptionPDF } from "./prescription.utils";

// GET | "/api/v1/prescriptions" | Get all prescriptions (Admin only)
const getAllPrescriptions = async () => {
  const result = await prisma.prescription.findMany({
    include: {
      patient: true,
      doctor: true,
      appointment: true,
    },
  });

  return result;
};

// GET | "/api/v1/prescriptions/my-prescriptions" | Get prescriptions for the logged-in user (Doctor or Patient)
const myPrescriptions = async (user: TRequestUser) => {
  const isUserExists = await prisma.user.findUnique({
    where: {
      email: user?.email,
    },
  });

  if (!isUserExists) {
    throw new NotFoundError("User not found");
  }

  if (isUserExists.role === UserRole.DOCTOR) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctor: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }

  if (isUserExists.role === UserRole.PATIENT) {
    const prescriptions = await prisma.prescription.findMany({
      where: {
        patient: {
          email: user?.email,
        },
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
      },
    });
    return prescriptions;
  }
};

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
const createPrescription = async (
  user: TRequestUser,
  payload: TCreatePrescriptionPayload,
) => {
  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointment = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: true,
        },
      },
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });

  if (appointment.doctorId !== doctor.id) {
    throw new ForbiddenError(
      "You can only give prescriptions for your own appointments",
    );
  }

  const isAlreadyPrescribed = await prisma.prescription.findUnique({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isAlreadyPrescribed) {
    throw new BadRequestError(
      "A prescription already exists for this appointment",
    );
  }

  const followUpDate = new Date(payload.followUpDate);

  const prescription = await prisma.$transaction(async (tx) => {
    const result = await tx.prescription.create({
      data: {
        ...payload,
        followUpDate,
        doctorId: doctor.id,
        patientId: appointment.patientId,
      },
    });

    const pdfBuffer = await generatePrescriptionPDF({
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email,
      appointmentDate: appointment.schedule.startDateTime,
      followUpDate: payload.followUpDate,
      instructions: payload.instructions,
      prescriptionId: result.id,
      createdAt: new Date(),
    });

    const filename = `prescription-${Date.now()}.pdf`;
    const uploadedFile = await uploadFileToCloudinary(pdfBuffer, filename);
    const pdfUrl = uploadedFile.secure_url;

    const updatedPrescription = await tx.prescription.update({
      where: {
        id: result.id,
      },
      data: {
        pdfUrl,
      },
    });

    try {
      const patient = appointment.patient;
      const doctor = appointment.doctor;

      await sendEmail({
        to: patient.email,
        subject: `You have received a new prescription from Dr. ${doctor.name}`,
        templateName: "prescription",
        templateData: {
          doctorName: doctor.name,
          doctorEmail: doctor.email,
          specialization: doctor.specialties
            .map((s: any) => s.title)
            .join(", "),
          patientName: patient.name,
          patientEmail: patient.email,
          appointmentDate: appointment.schedule.startDateTime.toLocaleString(),
          followUpDate: payload.followUpDate.toLocaleString(),
          instructions: payload.instructions,
          pdfUrl: pdfUrl,
          issuedDate: new Date().toLocaleDateString(),
          prescriptionId: result.id,
        },
        attachments: [
          {
            filename: "prescription.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (error) {
      console.error("Error sending prescription email:", error);
    }

    return updatedPrescription;
  });

  return prescription;
};

export const PrescriptionService = {
  createPrescription,
  myPrescriptions,
  getAllPrescriptions,
};
