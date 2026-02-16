import { Response } from "express";

interface IResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

export const sendResponse = <T>(resData: IResponseData<T>, res: Response) => {
  const { statusCode, success, message, data } = resData;
  return res.status(statusCode).json({
    success: success,
    message: message || "Request successful",
    data: data,
  });
};
