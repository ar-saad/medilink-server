import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorScheduleService } from "./doctorSchedule.service";

// POST | "/api/v1/doctor-schedules/create-my-doctor-schedule" | Doctor create their own schedule
const createMyDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const doctorSchedule = await DoctorScheduleService.createMyDoctorSchedule(
      user,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: status.CREATED,
      message: "Doctor schedule created successfully",
      data: doctorSchedule,
    });
  },
);

// GET | "/api/v1/doctor-schedules/my-doctor-schedules" | Doctor get their own schedules
const getMyDoctorSchedules = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await DoctorScheduleService.getMyDoctorSchedules();
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Doctor schedules retrieved successfully",
      data: result,
    });
  },
);

// GET | "/api/v1/doctor-schedules" | Admin get all doctor schedules
const getAllDoctorSchedules = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await DoctorScheduleService.getAllDoctorSchedules();
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "All doctor schedules retrieved successfully",
      data: result,
    });
  },
);

// GET | "/api/v1/doctor-schedules/:doctorId/schedule/:scheduleId" | Admin get doctor schedule by id
const getDoctorScheduleById = asyncHandler(
  async (req: Request, res: Response) => {
    const doctorSchedule = await DoctorScheduleService.getDoctorScheduleById();
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Doctor schedule retrieved successfully",
      data: doctorSchedule,
    });
  },
);

// PATCH | "/api/v1/doctor-schedules/update-my-doctor-schedule" | Doctor update their own schedule
const updateMyDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const updatedDoctorSchedule =
      await DoctorScheduleService.updateMyDoctorSchedule(user, payload);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Doctor schedule updated successfully",
      data: updatedDoctorSchedule,
    });
  },
);

// DELETE | "/api/v1/doctor-schedules/delete-my-doctor-schedule/:id" | Doctor delete their own schedule
const deleteMyDoctorSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    await DoctorScheduleService.deleteMyDoctorSchedule();
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Doctor schedule deleted successfully",
    });
  },
);

export const DoctorScheduleController = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
