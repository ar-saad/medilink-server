import { UserRole } from "../../../generated/prisma/enums";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreatePrescriptionPayload } from "./prescription.types";

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

  const prescription = await prisma.prescription.create({
    data: {
      ...payload,
      followUpDate,
      doctorId: doctor.id,
      patientId: appointment.patientId,
    },
  });

  return prescription;
};

export const PrescriptionService = {
  createPrescription,
  myPrescriptions,
  getAllPrescriptions,
};
