import app from "./app";
import { env } from "./config/env";

const bootstrap = async () => {
  try {
    app.listen(env.PORT, () => {
      console.log(
        `Server is running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
};

bootstrap();
