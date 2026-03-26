import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { TRequestUser } from "../../types/requestUser.type";
import { PatientService } from "./patient.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// PATCH | "/api/v1/patients/update-my-profile" | Update patient's own profile
const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const payload = req.body;

  const result = await PatientService.updateMyProfile(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
};
