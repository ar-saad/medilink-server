import { Router } from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createDoctorScheduleSchema,
  updateDoctorScheduleSchema,
} from "./doctorSchedule.schema";

const router = Router();

// POST | "/api/v1/doctor-schedules/create-my-doctor-schedule" | Doctor create their own schedule
router.post(
  "/create-my-doctor-schedule",
  checkAuth(UserRole.DOCTOR),
  validateRequest(createDoctorScheduleSchema),
  DoctorScheduleController.createMyDoctorSchedule,
);

// GET | "/api/v1/doctor-schedules/my-doctor-schedules" | Doctor get their own schedules
router.get(
  "/my-doctor-schedules",
  checkAuth(UserRole.DOCTOR),
  DoctorScheduleController.getMyDoctorSchedules,
);

// GET | "/api/v1/doctor-schedules" | Admin get all doctor schedules
router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorScheduleController.getAllDoctorSchedules,
);

// GET | "/api/v1/doctor-schedules/:doctorId/schedule/:scheduleId" | Admin get doctor schedule by id
router.get(
  "/:doctorId/schedule/:scheduleId",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  DoctorScheduleController.getDoctorScheduleById,
);

// PATCH | "/api/v1/doctor-schedules/update-my-doctor-schedule" | Doctor update their own schedule
router.patch(
  "/update-my-doctor-schedule",
  checkAuth(UserRole.DOCTOR),
  validateRequest(updateDoctorScheduleSchema),
  DoctorScheduleController.updateMyDoctorSchedule,
);

// DELETE | "/api/v1/doctor-schedules/delete-my-doctor-schedule/:scheduleId" | Doctor delete their own schedule
router.delete(
  "/delete-my-doctor-schedule/:scheduleId",
  checkAuth(UserRole.DOCTOR),
  DoctorScheduleController.deleteMyDoctorSchedule,
);

export const DoctorScheduleRouter = router;
