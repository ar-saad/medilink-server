import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { ScheduleController } from "./schedule.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createScheduleSchema, updateScheduleSchema } from "./schedule.schema";

const router = Router();

// POST | "/api/v1/schedule/" | Create a new schedule
router.post(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createScheduleSchema),
  ScheduleController.createSchedule,
);

// GET | "/api/v1/schedule/" | Get all schedules
router.get(
  "/",
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.getAllSchedules,
);

// GET | "/api/v1/schedule/:id" | Get a schedule by ID
router.get(
  "/:id",
  checkAuth(UserRole.DOCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.getScheduleById,
);

// PATCH | "/api/v1/schedule/:id" | Update a schedule by ID
router.patch(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateScheduleSchema),
  ScheduleController.updateSchedule,
);

// DELETE | "/api/v1/schedule/:id" | Delete a schedule by ID
router.delete(
  "/:id",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ScheduleController.deleteSchedule,
);

export const ScheduleRouter = router;
