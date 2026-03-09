import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../lib/prisma";
import { TCreateSchedulePayload } from "./schedule.types";
import { convertDateTime } from "./schedule.utils";

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
const getAllSchedules = async () => {};

// GET | "/api/v1/schedule/:id" | Get a schedule by ID
const getScheduleById = async () => {};

// PATCH | "/api/v1/schedule/:id" | Update a schedule by ID
const updateSchedule = async () => {};

// DELETE | "/api/v1/schedule/:id" | Delete a schedule by ID
const deleteSchedule = async () => {};

export const ScheduleService = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
