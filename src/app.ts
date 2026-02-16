import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { IndexRouter } from "./app/routers";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Router
app.use("/api/v1", IndexRouter);

// Root route
app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MediLink Server",
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;
