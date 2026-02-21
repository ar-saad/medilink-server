import { Response } from "express";
import { TResponse } from "../types/response.type";

export const sendResponse = <T>(res: Response, resData: TResponse<T>) => {
  const { statusCode, success, message, data } = resData;

  res.status(statusCode).json({
    success: success,
    message: message || "Request successful",
    data: data,
  });
};
