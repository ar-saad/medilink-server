import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AppointmentService } from "./appointment.service";
import status from "http-status";

// POST | "/api/v1/appointments/book-appointment" | Book an appointment
const bookAppointment = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;

  const result = await AppointmentService.bookAppointment(payload, user);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Appointment booked successfully",
    data: result,
  });
});

// GET | "/api/v1/appointments/my-appointments" | Get my appointments
const getMyAppointments = asyncHandler(async (req: Request, res: Response) => {
  const result = await AppointmentService.getMyAppointments();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

// PATCH | "/api/v1/appointments/change-appointment-status/:id" | Change appointment status
const changeAppointmentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AppointmentService.changeAppointmentStatus();

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Appointment status updated successfully",
      data: result,
    });
  },
);

// GET | "/api/v1/appointments/my-single-appointment/:id" | Get my single appointment
const getMySingleAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AppointmentService.getMySingleAppointment();

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Appointment retrieved successfully",
      data: result,
    });
  },
);

// GET | "/api/v1/appointments/all-appointments" | Get all appointments (Admin and Super Admin only)
const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const result = await AppointmentService.getAllAppointments();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Appointments retrieved successfully",
    data: result,
  });
});

// POST | "/api/v1/appointments/book-appointment-with-pay-later" | Book an appointment with pay later option
const bookAppointmentWithPayLater = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await AppointmentService.bookAppointmentWithPayLater();

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Appointment booked successfully",
      data: result,
    });
  },
);

// POST | "/api/v1/appointments/initiate-payment/:id" | Initiate payment for an appointment
const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const result = await AppointmentService.initiatePayment();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

export const AppointmentController = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
};
