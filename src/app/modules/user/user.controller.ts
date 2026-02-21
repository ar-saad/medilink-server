import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const createDoctor = asyncHandler(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await UserService.createDoctor(payload);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

export const UserController = {
  createDoctor,
};
