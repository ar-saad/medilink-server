import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { TRequestUser } from "../../types/requestUser.type";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

// POST | "/api/v1/reviews" | Patient create a review for an appointment
const createReview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const payload = req.body;

  const review = await ReviewService.createReview(user, payload);

  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Review created successfully",
    data: review,
  });
});

export const ReviewController = {
  createReview,
};
