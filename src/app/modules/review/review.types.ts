import * as z from "zod";
import { createReviewSchema, updateReviewSchema } from "./review.schema";

export type TCreateReviewPayload = z.infer<typeof createReviewSchema>;

export type TUpdateReviewPayload = z.infer<typeof updateReviewSchema>;
