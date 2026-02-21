import { NextFunction, Request, Response } from "express";
import * as z from "zod";

export const validateRequest = (zodSchema: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsedResult = zodSchema.safeParse(req.body);

    if (!parsedResult.success) {
      return next(parsedResult.error);
    }

    // Data sanitization
    req.body = parsedResult.data;
    next();
  };
};
