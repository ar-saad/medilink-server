import { uuidv7 } from "zod";
import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import { TCreateAppointmentPayload } from "./appointment.types";
import { AppointmentStatus, UserRole } from "../../../generated/prisma/enums";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";

//* POST | "/api/v1/appointments/book-appointment" | Book an appointment
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

//* GET | "/api/v1/appointments/my-appointments" | Get my appointments
const getMyAppointments = async (user: TRequestUser) => {
  //user can be patient or doctor, so we need to check both
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user?.email,
    },
  });

  let appointments = [];

  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new Error("User not found");
  }

  return appointments;
};

// TODOs
// 1. Completed Or Cancelled Appointments should not be allowed to update status
// 2. Doctors can only update Appointment status from schedule to inprogress or inprogress to completed or schedule to cancelled.
// 3. Patients can only cancel the scheduled appointment if it scheduled not completed or cancelled or inprogress.
// 4. Admin and Super admin can update to any status.

//* PATCH | "/api/v1/appointments/change-appointment-status/:id" | Change appointment status
const changeAppointmentStatus = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: TRequestUser,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      doctor: true,
    },
  });

  if (user?.role === UserRole.DOCTOR) {
    if (!(user?.email === appointmentData.doctor.email))
      throw new BadRequestError("This is not your appointment");
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: appointmentStatus,
    },
  });
};

// TODO: Refactoring on include of doctor and patient data in appointment details
//* GET | "/api/v1/appointments/my-single-appointment/:id" | Get my single appointment
const getMySingleAppointment = async (
  appointmentId: string,
  user: TRequestUser,
) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user?.email,
    },
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user?.email,
    },
  });

  let appointment;

  if (patientData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  }

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  return appointment;
};

// TODO: Implement Query Builder
//* GET | "/api/v1/appointments/all-appointments" | Get all appointments (Admin and Super Admin only)
const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  });
  return appointments;
};

//* POST | "/api/v1/appointments/book-appointment-with-pay-later" | Book an appointment with pay later option
const bookAppointmentWithPayLater = async () => {};

//* POST | "/api/v1/appointments/initiate-payment/:id" | Initiate payment for an appointment
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
