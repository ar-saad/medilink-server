import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { AppointmentController } from "./appointment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createAppointmentSchema } from "./appointment.schema";

const router = Router();

// POST | "/api/v1/appointments/book-appointment" | Book an appointment
router.post(
  "/book-appointment",
  checkAuth(UserRole.PATIENT),
  validateRequest(createAppointmentSchema),
  AppointmentController.bookAppointment,
);

// GET | "/api/v1/appointments/my-appointments" | Get my appointments
router.get(
  "/my-appointments",
  checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMyAppointments,
);

// PATCH | "/api/v1/appointments/change-appointment-status/:id" | Change appointment status
router.patch(
  "/change-appointment-status/:id",
  checkAuth(
    UserRole.PATIENT,
    UserRole.DOCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  AppointmentController.changeAppointmentStatus,
);

// GET | "/api/v1/appointments/my-single-appointment/:id" | Get my single appointment
router.get(
  "/my-single-appointment/:id",
  checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
  AppointmentController.getMySingleAppointment,
);

// GET | "/api/v1/appointments/all-appointments" | Get all appointments (Admin and Super Admin only)
router.get(
  "/all-appointments",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AppointmentController.getAllAppointments,
);

// POST | "/api/v1/appointments/book-appointment-with-pay-later" | Book an appointment with pay later option
router.post(
  "/book-appointment-with-pay-later",
  checkAuth(UserRole.PATIENT),
  AppointmentController.bookAppointmentWithPayLater,
);

// POST | "/api/v1/appointments/initiate-payment/:id" | Initiate payment for an appointment
router.post(
  "/initiate-payment/:id",
  checkAuth(UserRole.PATIENT),
  AppointmentController.initiatePayment,
);

export const AppointmentRoutes = router;
