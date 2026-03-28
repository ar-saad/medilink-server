import { BadRequestError, ForbiddenError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreatePrescriptionPayload } from "./prescription.types";

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
};
