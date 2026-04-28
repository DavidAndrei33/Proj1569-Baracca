import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";
import { logger } from "./logger.js";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// @ts-expect-error Prisma $on typing issue with strict TS
prisma.$on("query", (e: { query: string; duration: number }) => {
  logger.debug({ query: e.query, duration: e.duration + "ms" }, "Prisma query");
});
