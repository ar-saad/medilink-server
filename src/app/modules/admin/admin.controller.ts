import { Request, Response } from "express";
import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

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

  const updatedAdmin = await AdminService.updateAdmin(id as string, payload);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin updated successfully",
    data: updatedAdmin,
  });
});

// DELETE | "/api/v1/admins/:id" | Soft delete admin by ID
const deleteAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await AdminService.deleteAdmin(id as string);

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
  deleteAdmin,
  getAdminById,
};
