import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";

export function registerErrorHandler(app: FastifyInstance<any, any, any, any>): void {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      const issues = error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      }));
      logger.warn({ issues, url: request.url }, "Validation error");
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        issues,
      });
    }

    const err = error as { statusCode?: number; message: string; stack?: string };

    if (err.statusCode === 429) {
      logger.warn({ url: request.url, ip: request.ip }, "Rate limit exceeded");
      return reply.status(429).send({
        success: false,
        error: "Too many requests, please try again later",
      });
    }

    const statusCode =
      typeof err.statusCode === "number" ? err.statusCode : 500;

    if (statusCode >= 500) {
      logger.error(
        { err: error, url: request.url, method: request.method },
        "Server error"
      );
    }

    return reply.status(statusCode).send({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
  });

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: `Route ${request.method} ${request.url} not found`,
    });
  });
}
