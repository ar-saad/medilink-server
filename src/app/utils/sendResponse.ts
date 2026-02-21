import { Response } from "express";

interface IResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(res: Response, resData: IResponseData<T>) => {
  const { statusCode, success, message, data } = resData;

  res.status(statusCode).json({
    success: success,
    message: message || "Request successful",
    data: data,
  });
};
