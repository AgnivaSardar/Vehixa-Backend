import app from "./app";
import { prisma } from "./config/db";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const server = app.listen(env.PORT, () => {
  logger.info(`Vehixa backend running on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Disconnected from database and stopped server.");
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
