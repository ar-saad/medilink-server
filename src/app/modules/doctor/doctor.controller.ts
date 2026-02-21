import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorService } from "./doctor.service";
import { TUpdateDoctorPayload } from "./doctor.types";

const getAllDoctors = asyncHandler(async (req: Request, res: Response) => {
  const doctors = await DoctorService.getAllDoctors();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors,
  });
});

const getDoctorById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await DoctorService.getDoctorById(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully",
    data: doctor,
  });
});

const updateDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as TUpdateDoctorPayload;

  const updatedDoctor = await DoctorService.updateDoctor(id as string, payload);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully",
    data: updatedDoctor,
  });
});

const deleteDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await DoctorService.deleteDoctor(id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const DoctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
