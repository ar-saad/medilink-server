import * as z from "zod";
import { Gender } from "../../../generated/prisma/browser";

export const updateAdminSchema = z
  .object({
    name: z.string().min(1, "Name is required and must be a string"),
    profilePhoto: z.url("Profile photo must be a valid URL"),
    contactNumber: z
      .string()
      .min(11, "Contact number must be at least 11 digits")
      .max(14, "Contact number must be less than 14 digits"),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
