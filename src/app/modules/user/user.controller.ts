import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import {
  TCreateAdminPayload,
  TCreateDoctorPayload,
  TCreateSuperAdminPayload,
} from "./user.types";

// POST | "/api/v1/users/create-doctor" | Create a new doctor user
const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as TCreateDoctorPayload;

  const result = await UserService.createDoctor(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

// POST | "/api/v1/users/create-admin" | Create a new admin user (requires SUPER_ADMIN role)
const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as TCreateAdminPayload;

  const result = await UserService.createAdmin(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

// POST | "/api/v1/users/create-super-admin" | Create a new super admin user (requires SUPER_ADMIN role)
const createSuperAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as TCreateSuperAdminPayload;

  const result = await UserService.createSuperAdmin(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Super Admin created successfully",
    data: result,
  });
});

export const UserController = {
  createDoctor,
  createAdmin,
  createSuperAdmin,
};
