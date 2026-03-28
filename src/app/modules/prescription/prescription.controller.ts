import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { PrescriptionService } from "./prescription.service";

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
};
