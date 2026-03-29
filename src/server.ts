import { Server } from "http";
import app from "./app";
import { env } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

let server: Server;

const bootstrap = async () => {
  try {
    await seedSuperAdmin();

    server = app.listen(env.PORT, () => {
      console.log(
        `Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

// SIGTERM signal handler - Gracefully shuts down the server when a termination signal is received
process.on("SIGTERM", () => {
  console.log("SIGTERM received... Shutting down server:");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// SIGINT signal handler - Gracefully shuts down the server when an interrupt signal is received (e.g., Ctrl+C)
process.on("SIGINT", () => {
  console.log("SIGINT received... Shutting down server:");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Uncaught exception handler - Catches any uncaught exceptions and gracefully shuts down the server
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception Detected... Shutting down server:", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Unhandled rejection handler - Catches any unhandled promise rejections and gracefully shuts down the server
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection Detected... Shutting down server:", error);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

bootstrap();
