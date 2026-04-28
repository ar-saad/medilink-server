import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { ScheduleService } from "./schedule.service";
import { Request, Response } from "express";
import { TQueryParams } from "../../types/query.type";

// POST | "/api/v1/schedule/" | Create a new schedule
const createSchedule = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await ScheduleService.createSchedule(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: result,
  });
});

// GET | "/api/v1/schedule/" | Get all schedules
const getAllSchedules = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as TQueryParams;
  const result = await ScheduleService.getAllSchedules(query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedules retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

// GET | "/api/v1/schedule/:id" | Get a schedule by ID
const getScheduleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ScheduleService.getScheduleById(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule retrieved successfully",
    data: result,
  });
});

// PATCH | "/api/v1/schedule/:id" | Update a schedule by ID
const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await ScheduleService.updateSchedule(id as string, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule updated successfully",
    data: result,
  });
});

// DELETE | "/api/v1/schedule/:id" | Delete a schedule by ID
const deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await ScheduleService.deleteSchedule(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Schedule deleted successfully",
    data: result,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
