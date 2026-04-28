import { buildApp } from "./app.js";
import { env } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./utils/prisma.js";
import { redis } from "./utils/redis.js";

async function startServer() {
  try {
    const app = await buildApp();

    await app.listen({ port: env.PORT, host: env.HOST });
    logger.info(
      `Server running on http://${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode`
    );
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    await prisma.$disconnect();
    await redis.quit();
    logger.info("Cleanup completed. Exiting.");
    process.exit(0);
  } catch (err) {
    logger.error(err, "Error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();
