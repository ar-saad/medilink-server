import { Response } from "express";
import { TResponse } from "../types/response.type";

export const sendResponse = <T>(res: Response, resData: TResponse<T>) => {
  const { statusCode, success, message, data, meta } = resData;

  res.status(statusCode).json({
    success,
    message: message || "Request successful",
    data,
    meta,
  });
};
