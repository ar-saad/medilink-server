import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { asyncHandler } from "../../utils/asyncHandler";

const createSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await SpecialtyService.createSpecialty(payload);

  res.status(201).json({
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getAllSpecialties = asyncHandler(async (req: Request, res: Response) => {
  const result = await SpecialtyService.getAllSpecialties();

  res.status(200).json({
    success: true,
    message: "Specialties retrieved successfully",
    data: result,
  });
});

const updateSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await SpecialtyService.updateSpecialty(id as string, payload);

  res.status(200).json({
    success: true,
    message: "Specialty updated successfully",
    data: result,
  });
});

const deleteSpecialty = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtyService.deleteSpecialty(id as string);

  res.status(200).json({
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
