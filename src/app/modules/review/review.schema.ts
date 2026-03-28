import * as z from "zod";

export const createReviewSchema = z.object({
  appointmentId: z.string("Appointment ID is required"),
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: z
    .string("Comment is required")
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters"),
});

export const updateReviewSchema = z.object({
  rating: z
    .number("Rating is required")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .optional(),
  comment: z
    .string("Comment is required")
    .min(1, "Comment cannot be empty")
    .max(500, "Comment cannot exceed 500 characters")
    .optional(),
});
