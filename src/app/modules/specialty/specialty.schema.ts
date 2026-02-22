import * as z from "zod";

export const createSpecialtySchema = z.object({
  title: z.string("Title is required"),
  description: z.string("Description is required").optional(),
  icon: z.url("Icon must be a valid URL").optional(),
});

export const updateSpecialtySchema = z
  .object({
    title: z.string("Title must be a string"),
    description: z.string("Description must be a string"),
    icon: z.url("Icon must be a valid URL"),
  })
  .partial()
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    },
  );
