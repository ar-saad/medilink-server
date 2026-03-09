import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import {
  TCreateSchedulePayload,
  TUpdateSchedulePayload,
} from "./schedule.types";
import { convertDateTime } from "./schedule.utils";
import { TQueryParams } from "../../types/query.type";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import {
  scheduleFilterableFields,
  scheduleIncludeConfig,
  scheduleSearchableFields,
} from "./schedule.constant";

// POST | "/api/v1/schedule/" | Create a new schedule
const createSchedule = async (payload: TCreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30; // 30 minutes

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const schedules = [];

  while (currentDate <= lastDate) {
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}}`,
          Number(startTime.split(":")[0]),
        ),
        Number(startTime.split(":")[1]),
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}}`,
          Number(endTime.split(":")[0]),
        ),
        Number(endTime.split(":")[1]),
      ),
    );

    while (startDateTime < endDateTime) {
      const s = await convertDateTime(startDateTime);
      const e = await convertDateTime(addMinutes(startDateTime, interval));

      const scheduleItem = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleItem.startDateTime,
          endDateTime: scheduleItem.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleItem,
        });

        schedules.push(result);
      }

      // Increment the start time by the interval
      startDateTime.setMinutes(startDateTime.getMinutes() + interval);
    }

    // Move to the next day after processing the schedules for the current day
    startDateTime.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

// GET | "/api/v1/schedule/" | Get all schedules
const getAllSchedules = async (query: TQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {
    searchableFields: scheduleSearchableFields,
    filterableFields: scheduleFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(scheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

  return result;
};

// GET | "/api/v1/schedule/:id" | Get a schedule by ID
const getScheduleById = async (id: string) => {
  const schedule = await prisma.schedule.findUnique({
    where: {
      id: id,
    },
  });
  return schedule;
};

// PATCH | "/api/v1/schedule/:id" | Update a schedule by ID
const updateSchedule = async (id: string, payload: TUpdateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const startDateTime = new Date(
    addMinutes(
      addHours(
        `${format(new Date(startDate), "yyyy-MM-dd")}`,
        Number(startTime.split(":")[0]),
      ),
      Number(startTime.split(":")[1]),
    ),
  );

  const endDateTime = new Date(
    addMinutes(
      addHours(
        `${format(new Date(endDate), "yyyy-MM-dd")}`,
        Number(endTime.split(":")[0]),
      ),
      Number(endTime.split(":")[1]),
    ),
  );

  const updatedSchedule = await prisma.schedule.update({
    where: {
      id: id,
    },
    data: {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    },
  });

  return updatedSchedule;
};

// DELETE | "/api/v1/schedule/:id" | Delete a schedule by ID
const deleteSchedule = async (id: string) => {
  await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
  return true;
};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
