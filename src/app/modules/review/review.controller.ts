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

// GET | "/api/v1/reviews" | Get all reviews
const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Reviews retrieval successfully",
    data: result,
  });
});

// GET | "/api/v1/reviews/my-reviews" | Get my reviews (for patient and doctor)
const myReviews = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;

  const result = await ReviewService.myReviews(user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Reviews retrieval successfully",
    data: result,
  });
});

// PATCH | "/api/v1/reviews/:id" | Patient update a review
const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const reviewId = req.params.id;
  const payload = req.body;

  const result = await ReviewService.updateReview(
    user,
    reviewId as string,
    payload,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

// DELETE | "/api/v1/reviews/:id" | Patient delete a review
const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as TRequestUser;
  const reviewId = req.params.id;

  const result = await ReviewService.deleteReview(user, reviewId as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};
