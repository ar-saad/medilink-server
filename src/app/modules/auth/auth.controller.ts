import status from "http-status";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const registerPatient = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const result = await AuthService.registerPatient({
    name,
    email,
    password,
  });

  sendResponse(
    {
      statusCode: status.CREATED,
      success: true,
      message: "Patient registered successfully",
      data: result,
    },
    res,
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.loginUser({
    email,
    password,
  });

  sendResponse(
    {
      statusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: result,
    },
    res,
  );
});

export const AuthController = {
  registerPatient,
  loginUser,
};
