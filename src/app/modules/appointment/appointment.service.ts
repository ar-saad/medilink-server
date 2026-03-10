import { uuidv7 } from "zod";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreateAppointmentPayload } from "./appointment.types";

// POST | "/api/v1/appointments/book-appointment" | Book an appointment
const bookAppointment = async (
  payload: TCreateAppointmentPayload,
  user: TRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorScheduleData = await prisma.doctorSchedule.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: doctorData.id,
        patientId: patientData.id,
        scheduleId: doctorScheduleData.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedule.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: scheduleData.id,
        },
      },
      data: {
        isBooked: true,
      },
    });

    //TODO: Payment integration will be done here in future

    return appointmentData;
  });

  return result;
};

// GET | "/api/v1/appointments/my-appointments" | Get my appointments
const getMyAppointments = async () => {};

// PATCH | "/api/v1/appointments/change-appointment-status/:id" | Change appointment status
const changeAppointmentStatus = async () => {};

// GET | "/api/v1/appointments/my-single-appointment/:id" | Get my single appointment
const getMySingleAppointment = async () => {};

// GET | "/api/v1/appointments/all-appointments" | Get all appointments (Admin and Super Admin only)
const getAllAppointments = async () => {};

// POST | "/api/v1/appointments/book-appointment-with-pay-later" | Book an appointment with pay later option
const bookAppointmentWithPayLater = async () => {};

// POST | "/api/v1/appointments/initiate-payment/:id" | Initiate payment for an appointment
const initiatePayment = async () => {};

export const AppointmentService = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
};
