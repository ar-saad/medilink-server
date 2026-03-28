import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema } from "./review.schema";
import { ReviewController } from "./review.controller";

const router = Router();

// POST | "/api/v1/reviews" | Patient create a review for an appointment
router.post(
  "/",
  checkAuth(UserRole.PATIENT),
  validateRequest(createReviewSchema),
  ReviewController.createReview,
);

export const ReviewRouter = router;
