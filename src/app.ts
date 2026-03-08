import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { IndexRouter } from "./app/routers";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { env } from "./app/config/env";
import qs from "qs";

const app: Application = express();

// Parser to handle nested query parameters using qs library
app.set("query parser", (str: string) => qs.parse(str));

// Set EJS as the view engine and configure views directory
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// CORS configuration
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      "http://localhost:5173",
      "http://localhost:5000",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Mount better-auth routes at /api/auth
app.use("/api/auth", toNodeHandler(auth));

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

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
// Not found route handler
app.use(notFound);

export default app;
