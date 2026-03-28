import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { PrescriptionService } from "./prescription.service";

// GET | "/api/v1/prescriptions" | Get all prescriptions (Admin only)
const getAllPrescriptions = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await PrescriptionService.getAllPrescriptions();

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Prescriptions retrieval successfully",
      data: result,
    });
  },
);

// GET | "/api/v1/prescriptions/my-prescriptions" | Get prescriptions for the logged-in user (Doctor or Patient)
const myPrescriptions = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await PrescriptionService.myPrescriptions(user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Prescription fetched successfully",
    data: result,
  });
});

// POST | "/api/v1/prescriptions" | Create a new prescription for an appointment
const createPrescription = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;

  const result = await PrescriptionService.createPrescription(user, payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

export const PrescriptionController = {
  createPrescription,
  myPrescriptions,
  getAllPrescriptions,
};
