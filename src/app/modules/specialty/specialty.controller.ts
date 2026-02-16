import { Request, Response } from "express";
import { SpecialtyService } from "./specialty.service";

const createSpecialty = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const result = await SpecialtyService.createSpecialty(payload);

    res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error creating specialty:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the specialty",
      error: error.message,
    });
  }
};

const getAllSpecialties = async (req: Request, res: Response) => {
  try {
    const result = await SpecialtyService.getAllSpecialties();

    res.status(200).json({
      success: true,
      message: "Specialties retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error retrieving specialties:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving specialties",
      error: error.message,
    });
  }
};

const updateSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const result = await SpecialtyService.updateSpecialty(
      id as string,
      payload,
    );

    res.status(200).json({
      success: true,
      message: "Specialty updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating specialty:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the specialty",
      error: error.message,
    });
  }
};

const deleteSpecialty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await SpecialtyService.deleteSpecialty(id as string);

    res.status(200).json({
      success: true,
      message: "Specialty deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting specialty:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the specialty",
      error: error.message,
    });
  }
};

export const SpecialtyController = {
  createSpecialty,
  getAllSpecialties,
  updateSpecialty,
  deleteSpecialty,
};
