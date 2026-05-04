import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { TRequestUser } from "../../types/requestUser.type";
import { PatientService } from "./patient.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// PATCH | "/api/v1/patients/my-profile" | Update patient's own profile
const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const payload = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  // Handle profile photo
  if (files?.profilePhoto?.[0]) {
    if (!payload.patientInfo) {
      payload.patientInfo = {};
    }
    payload.patientInfo.profilePhoto = files.profilePhoto[0].path;
  }

  // Handle medical reports
  if (files?.medicalReports && files?.medicalReports.length > 0) {
    const newReports = files.medicalReports.map((file) => ({
      reportName:
        file.originalname || `Medical Report - ${new Date().getTime()}`,
      reportLink: file.path,
    }));

    if (payload.medicalReports && Array.isArray(payload.medicalReports)) {
      payload.medicalReports = [...payload.medicalReports, ...newReports];
    } else {
      payload.medicalReports = newReports;
    }
  }

  const result = await PatientService.updateMyProfile(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile updated successfully",
    data: result,
  });
});

// GET | "/api/v1/patients/my-profile" | Get patient's own profile
const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const result = await PatientService.getMyProfile(user);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Profile fetched successfully",
    data: result,
  });
});

export const PatientController = {
  updateMyProfile,
  getMyProfile,
};
