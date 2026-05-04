import { DoctorSchedule, Prisma } from "../../../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { TQueryParams } from "../../types/query.type";
import { TRequestUser } from "../../types/requestUser.type";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  doctorScheduleFilterableFields,
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constants";
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

  const requestedIds = Array.from(new Set(payload.scheduleIds));

  if (requestedIds.length === 0) {
    throw new BadRequestError("At least one schedule must be selected");
  }

  // Validate all schedules exist and are in the future
  const schedules = await prisma.schedule.findMany({
    where: {
      id: { in: requestedIds },
    },
  });

  if (schedules.length !== requestedIds.length) {
    throw new NotFoundError("One or more schedules were not found");
  }

  const now = new Date();
  const expiredSchedule = schedules.find(
    (schedule) => schedule.startDateTime <= now,
  );

  if (expiredSchedule) {
    throw new BadRequestError(
      "You can only book schedules with a start time in the future",
    );
  }

  // Skip schedules already assigned to this doctor (idempotent)
  const existingAssignments = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: { in: requestedIds },
    },
    select: { scheduleId: true },
  });

  const alreadyAssigned = new Set(
    existingAssignments.map((item) => item.scheduleId),
  );

  const newScheduleIds = requestedIds.filter((id) => !alreadyAssigned.has(id));

  if (newScheduleIds.length === 0) {
    throw new BadRequestError(
      "All selected schedules are already in your list",
    );
  }

  const doctorScheduleData = newScheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));

  await prisma.doctorSchedule.createMany({
    data: doctorScheduleData,
    skipDuplicates: true,
  });

  const result = await prisma.doctorSchedule.findMany({
    where: {
      doctorId: doctorData.id,
      scheduleId: {
        in: newScheduleIds,
      },
    },
    include: {
      schedule: true,
    },
  });

  return result;
};

// GET | "/api/v1/doctor-schedules/my-doctor-schedules" | Doctor get their own schedules
const getMyDoctorSchedules = async (
  user: TRequestUser,
  query: TQueryParams,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    Prisma.DoctorScheduleWhereInput,
    Prisma.DoctorScheduleInclude
  >(
    prisma.doctorSchedule,
    {
      doctorId: doctorData.id,
      ...query,
    },
    {
      filterableFields: doctorScheduleFilterableFields,
      searchableFields: doctorScheduleSearchableFields,
    },
  );

  const doctorSchedules = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include({
      schedule: true,
      doctor: {
        include: {
          user: true,
        },
      },
    })
    .sort()
    .fields()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .execute();

  return doctorSchedules;
};

// GET | "/api/v1/doctor-schedules" | Admin get all doctor schedules
const getAllDoctorSchedules = async (query: TQueryParams) => {
  const queryBuilder = new QueryBuilder<
    DoctorSchedule,
    Prisma.DoctorScheduleWhereInput,
    Prisma.DoctorScheduleInclude
  >(prisma.doctorSchedule, query, {
    filterableFields: doctorScheduleFilterableFields,
    searchableFields: doctorScheduleSearchableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .include({
      schedule: true,
      doctor: {
        include: {
          user: true,
        },
      },
    })
    .dynamicInclude(doctorScheduleIncludeConfig)
    .sort()
    .execute();

  return result;
};

// GET | "/api/v1/doctor-schedules/:doctorId/schedule/:scheduleId" | Admin get doctor schedule by id
const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
  const doctorSchedule = await prisma.doctorSchedule.findUnique({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorId,
        scheduleId: scheduleId,
      },
    },
    include: {
      schedule: true,
      doctor: true,
    },
  });

  if (!doctorSchedule) {
    throw new NotFoundError("Doctor schedule not found");
  }

  return doctorSchedule;
};

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

// DELETE | "/api/v1/doctor-schedules/delete-my-doctor-schedule/:scheduleId" | Doctor delete their own schedule
const deleteMyDoctorSchedule = async (
  scheduleId: string,
  user: TRequestUser,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  await prisma.doctorSchedule.deleteMany({
    where: {
      isBooked: false,
      doctorId: doctorData.id,
      scheduleId,
    },
  });
};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
