import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import staticPlugin from "@fastify/static";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import path from "node:path";
import { fileURLToPath } from "node:url";
import promClient from "prom-client";

import { env } from "./utils/env.js";
import { logger } from "./utils/logger.js";
import { redis } from "./utils/redis.js";
import { registerErrorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { categoryRoutes } from "./routes/category.routes.js";
import { productRoutes } from "./routes/product.routes.js";
import { orderRoutes } from "./routes/order.routes.js";
import { sseRoutes } from "./routes/sse.routes.js";
import { settingsRoutes } from "./routes/settings.routes.js";
import { paymentRoutes } from "./routes/payment.routes.js";
import { reportRoutes } from "./routes/report.routes.js";
import { uploadRoutes } from "./routes/upload.routes.js";
import { reservationRoutes } from "./routes/reservation.routes.js";
import { tableRoutes } from "./routes/table.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: true,
    bodyLimit: env.UPLOAD_MAX_SIZE,
  });

  // Error handling must be registered before any routes/plugins
  registerErrorHandler(app);

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });

  // CORS
  const corsOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
  await app.register(cors, {
    origin: corsOrigins.includes("*") ? true : corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Rate limiting with Redis
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    redis: redis,
    keyGenerator: (req) => req.ip ?? "unknown",
    errorResponseBuilder: (_req, _context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
  });

  // File upload
  await app.register(multipart, {
    limits: {
      fileSize: env.UPLOAD_MAX_SIZE,
      files: 1,
    },
  });

  // Static files
  await app.register(staticPlugin, {
    root: path.join(__dirname, "..", env.UPLOAD_DIR),
    prefix: "/uploads/",
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Rotiserie Moinesti API",
        description: "Backend API v2 for Rotiserie & Pizza Moinesti",
        version: "2.0.0",
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
  });

  // Prometheus metrics
  const httpRequestsTotal = new promClient.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status"],
  });

  const httpRequestDuration = new promClient.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  });

  app.addHook("onResponse", async (request, reply) => {
    const route = request.routeOptions?.url ?? "unknown";
    const status = reply.statusCode.toString();
    httpRequestsTotal.inc({ method: request.method, route, status });
    httpRequestDuration.observe(
      { method: request.method, route, status },
      reply.elapsedTime / 1000
    );
  });

  app.get("/metrics", async (_request, reply) => {
    reply.header("Content-Type", promClient.register.contentType);
    return promClient.register.metrics();
  });

  // Health check
  app.get("/health", async (_request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = redis.status === "ready" || redis.status === "connect";

    const status = dbHealthy && redisHealthy ? 200 : 503;
    return reply.status(status).send({
      status: status === 200 ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? "up" : "down",
        redis: redisHealthy ? "up" : "down",
      },
    });
  });

  // Readiness probe
  app.get("/ready", async (_request, reply) => {
    const dbHealthy = await checkDatabaseHealth();
    const redisHealthy = redis.status === "ready" || redis.status === "connect";

    if (dbHealthy && redisHealthy) {
      return reply.send({ ready: true });
    }
    return reply.status(503).send({ ready: false });
  });

  // Routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(categoryRoutes, { prefix: "/api/categories" });
  await app.register(productRoutes, { prefix: "/api/products" });
  await app.register(orderRoutes, { prefix: "/api/orders" });
  await app.register(sseRoutes, { prefix: "/api/events" });
  await app.register(settingsRoutes, { prefix: "/api/settings" });
  await app.register(paymentRoutes, { prefix: "/api/payments" });
  await app.register(reportRoutes, { prefix: "/api/reports" });
  await app.register(uploadRoutes, { prefix: "/api/upload" });
  await app.register(reservationRoutes, { prefix: "/api/reservations" });
  await app.register(tableRoutes, { prefix: "/api/tables" });

  return app;
}

async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { prisma } = await import("./utils/prisma.js");
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
