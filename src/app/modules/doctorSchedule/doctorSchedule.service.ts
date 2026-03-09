import { prisma } from "../../lib/prisma";
import { TRequestUser } from "../../types/requestUser.type";
import {
  TCreateDoctorSchedulePayload,
  TUpdateDoctorSchedulePayload,
} from "./doctorSchedule.types";

// POST | "/api/v1/doctor-schedules/create-my-doctor-schedule" | Doctor create their own schedule
const createMyDoctorSchedule = async (
  user: TRequestUser,
  payload: TCreateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  const result = await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
  });

  return result;
};

// GET | "/api/v1/doctor-schedules/my-doctor-schedules" | Doctor get their own schedules
const getMyDoctorSchedules = async () => {};

// GET | "/api/v1/doctor-schedules" | Admin get all doctor schedules
const getAllDoctorSchedules = async () => {};

// GET | "/api/v1/doctor-schedules/:doctorId/schedule/:scheduleId" | Admin get doctor schedule by id
const getDoctorScheduleById = async () => {};

// PATCH | "/api/v1/doctor-schedules/update-my-doctor-schedule" | Doctor update their own schedule
const updateMyDoctorSchedule = async (
  user: TRequestUser,
  payload: TUpdateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const deleteIds = payload.scheduleIds
    .filter((schedule) => schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const createIds = payload.scheduleIds
    .filter((schedule) => !schedule.shouldDelete)
    .map((schedule) => schedule.id);

  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedule.deleteMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });

    const doctorScheduleData = createIds.map((scheduleId) => ({
      doctorId: doctorData.id,
      scheduleId,
    }));

    const result = await tx.doctorSchedule.createMany({
      data: doctorScheduleData,
    });

    return result;
  });

  return result;
};

// DELETE | "/api/v1/doctor-schedules/delete-my-doctor-schedule/:id" | Doctor delete their own schedule
const deleteMyDoctorSchedule = async () => {};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
