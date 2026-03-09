import * as z from "zod";

export const createDoctorScheduleSchema = z.object({
  scheduleIds: z.array(z.uuid()).min(1, "At least one schedule ID is required"),
});

export const updateDoctorScheduleSchema = z.object({
  scheduleIds: z
    .array(
      z.object({
        shouldDelete: z.boolean(),
        id: z.uuid(),
      }),
    )
    .min(1, "At least one schedule is required"),
});
