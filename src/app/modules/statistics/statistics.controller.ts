import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { StatisticsService } from "./statistics.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { TRequestUser } from "../../types/requestUser.type";

const getDashboardStatsData = asyncHandler(
  async (req: Request, res: Response) => {
    const user: TRequestUser = req.user;

    const result = await StatisticsService.getDashboardStatsData(user);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Dashboard stats data retrieved successfully",
      data: result,
    });
  },
);

export const StatisticsController = {
  getDashboardStatsData,
};
