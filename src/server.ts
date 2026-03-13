import app from "./app";
import { env } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";

const bootstrap = async () => {
  try {
    await seedSuperAdmin();

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
