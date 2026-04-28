import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { subscribeToOrderEvents } from "../utils/events.js";
import { logger } from "../utils/logger.js";

export async function sseRoutes(app: FastifyInstance): Promise<void> {
  // SSE endpoint for order status updates
  app.get("/orders/:id", {
    schema: {
      tags: ["Real-time"],
      description: "Server-Sent Events for order status updates",
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const orderId = Number((request.params as any).id);

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      // Send initial connection message
      reply.raw.write(
        `event: connected\ndata: ${JSON.stringify({
          orderId,
          message: "Subscribed to order updates",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      const unsubscribe = subscribeToOrderEvents((event) => {
        if (event.orderId === orderId) {
          reply.raw.write(
            `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
          );
        }
      });

      request.raw.on("close", () => {
        logger.debug({ orderId }, "SSE client disconnected");
        unsubscribe();
      });

      request.raw.on("error", () => {
        unsubscribe();
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        reply.raw.write(`event: heartbeat\ndata: {}\n\n`);
      }, 30000);

      request.raw.on("close", () => {
        clearInterval(heartbeat);
      });
    },
  });

  // SSE endpoint for kitchen (all new orders)
  app.get("/kitchen", {
    preHandler: [
      async (request, reply) => {
        // Simple check for kitchen/admin - can be enhanced with auth
        const apiKey = request.headers["x-api-key"] as string;
        if (apiKey !== process.env.KITCHEN_API_KEY) {
          // Allow in development without key
          if (process.env.NODE_ENV === "production") {
            return reply.status(403).send({
              success: false,
              error: "Forbidden",
            });
          }
        }
      },
    ],
    schema: {
      tags: ["Real-time"],
      description: "Server-Sent Events for kitchen (all orders)",
    },
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      reply.raw.write(
        `event: connected\ndata: ${JSON.stringify({
          message: "Subscribed to kitchen updates",
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      const unsubscribe = subscribeToOrderEvents((event) => {
        reply.raw.write(
          `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`
        );
      });

      request.raw.on("close", () => {
        logger.debug("Kitchen SSE client disconnected");
        unsubscribe();
      });

      const heartbeat = setInterval(() => {
        reply.raw.write(`event: heartbeat\ndata: {}\n\n`);
      }, 30000);

      request.raw.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    },
  });
}
