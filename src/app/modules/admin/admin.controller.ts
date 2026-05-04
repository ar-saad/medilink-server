import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";
import { TRequestUser } from "../../types/requestUser.type";
import {
  TChangeUserRolePayload,
  TChangeUserStatusPayload,
} from "./admin.types";

// GET | "/api/v1/admins" | Get all admins
const getAllAdmins = asyncHandler(async (req: Request, res: Response) => {
  const result = await AdminService.getAllAdmins();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admins fetched successfully",
    data: result,
  });
});

// GET | "/api/v1/admins/:id" | Get admin by ID
const getAdminById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const admin = await AdminService.getAdminById(id as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin fetched successfully",
    data: admin,
  });
});

// PATCH | "/api/v1/admins/:id" | Update admin by ID
const updateAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  if (files?.profilePhoto?.[0]) {
    payload.profilePhoto = files.profilePhoto[0].path;
  }

  const updatedAdmin = await AdminService.updateAdmin(id as string, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: updatedAdmin,
  });
});

// PATCH | "/api/v1/admins/change-user-status" | Change user status
const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const payload = req.body as TChangeUserStatusPayload;

  const result = await AdminService.changeUserStatus(user, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

// PATCH | "/api/v1/admins/change-user-role" | Change user role (Super Admin only)
const changeUserRole = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const payload = req.body as TChangeUserRolePayload;

  const result = await AdminService.changeUserRole(user, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User role updated successfully",
    data: result,
  });
});

// DELETE | "/api/v1/admins/:id" | Soft delete admin by ID
const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as TRequestUser;

  const result = await AdminService.deleteAdmin(id as string, user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

export const AdminController = {
  getAllAdmins,
  updateAdmin,
  getAdminById,
  changeUserStatus,
  changeUserRole,
  deleteAdmin,
};
