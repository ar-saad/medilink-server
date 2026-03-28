import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema, updateReviewSchema } from "./review.schema";
import { ReviewController } from "./review.controller";

const router = Router();

// POST | "/api/v1/reviews" | Patient create a review for an appointment
router.post(
  "/",
  checkAuth(UserRole.PATIENT),
  validateRequest(createReviewSchema),
  ReviewController.createReview,
);

// GET | "/api/v1/reviews" | Get all reviews
router.get("/", ReviewController.getAllReviews);

// GET | "/api/v1/reviews/my-reviews" | Get my reviews (for patient and doctor)
router.get(
  "/my-reviews",
  checkAuth(UserRole.PATIENT, UserRole.DOCTOR),
  ReviewController.myReviews,
);

// PATCH | "/api/v1/reviews/:id" | Patient update a review
router.patch(
  "/:id",
  checkAuth(UserRole.PATIENT),
  validateRequest(updateReviewSchema),
  ReviewController.updateReview,
);

// DELETE | "/api/v1/reviews/:id" | Patient delete a review
router.delete(
  "/:id",
  checkAuth(UserRole.PATIENT),
  ReviewController.deleteReview,
);

export const ReviewRouter = router;
