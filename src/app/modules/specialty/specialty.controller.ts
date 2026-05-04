import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import {
  TCreateSpecialtyPayload,
  TUpdateSpecialtyPayload,
} from "./specialty.types";

// POST | "/api/v1/specialties" | Create a new specialty
const createSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body as TCreateSpecialtyPayload;

  const result = await SpecialtyService.createSpecialty({
    ...payload,
    icon: req.file?.path,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

// GET | "/api/v1/specialties" | Get all specialties
const getAllSpecialties = asyncHandler(async (req: Request, res: Response) => {
  const result = await SpecialtyService.getAllSpecialties();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialties retrieved successfully",
    data: result,
  });
});

// PATCH | "/api/v1/specialties/:id" | Update a specialty by ID
const updateSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as TUpdateSpecialtyPayload;

  const result = await SpecialtyService.updateSpecialty(id as string, {
    ...payload,
    icon: req.file?.path,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty updated successfully",
    data: result,
  });
});

// DELETE | "/api/v1/specialties/:id" | Delete a specialty by ID
const deleteSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtyService.deleteSpecialty(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialties,
  updateSpecialty,
  deleteSpecialty,
};
