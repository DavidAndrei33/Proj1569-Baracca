import type { FastifyInstance } from "fastify";
import { authenticate, requireKitchen } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByIdAndPhone,
  updateOrderStatus,
  getOrderStats,
  getMyOrders,
} from "../services/order.service.js";
import {
  createOrderSchema,
  updateStatusSchema,
  orderQuerySchema,
} from "../validations/order.validation.js";

export async function orderRoutes(app: FastifyInstance): Promise<void> {
  // Public: Create order (with optional auth)
  app.post("/", {
    preHandler: async (request, _reply) => {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const { verifyToken } = await import("../utils/jwt.js");
          const { prisma } = await import("../utils/prisma.js");
          const token = authHeader.slice(7);
          const payload = verifyToken(token);
          const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, isActive: true },
          });
          if (user && user.isActive) {
            request.user = payload;
          }
        } catch {
          // Invalid token - proceed as guest
        }
      }
    },
    schema: {
      tags: ["Orders"],
      description: "Create a new order",
      body: {
        type: "object",
        properties: {
          orderType: { type: "string", enum: ["TAKEAWAY", "DINE_IN"], default: "TAKEAWAY" },
          customerName: { type: "string", minLength: 2 },
          customerPhone: { type: "string", minLength: 5 },
          customerAddress: { type: "string", minLength: 5 },
          pickupTime: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "integer" },
                quantity: { type: "integer", minimum: 1 },
              },
              required: ["productId", "quantity"],
            },
            minItems: 1,
          },
          paymentMethod: { type: "string", enum: ["cash", "card", "online"] },
          notes: { type: "string" },
        },
        required: ["customerName", "customerPhone", "items", "paymentMethod"],
      },
    },
    handler: async (request, reply) => {
      const data = createOrderSchema.parse(request.body);

      if (request.user) {
        (data as any).userId = request.user.userId;
        (data as any).customerEmail = request.user.email;
      }

      const order = await createOrder(data);
      reply.status(201).send({ success: true, data: order });
    },
  });

  // Kitchen/Admin: List orders
  app.get("/", {
    preHandler: requireKitchen,
    schema: {
      tags: ["Orders"],
      description: "List orders with filters (kitchen/admin)",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          status: { type: "string" },
          phone: { type: "string" },
          dateFrom: { type: "string" },
          dateTo: { type: "string" },
          page: { type: "integer", minimum: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
      },
    },
    handler: async (request, reply) => {
      const query = orderQuerySchema.parse(request.query);
      const result = await getOrders(query);
      reply.send({ success: true, data: result });
    },
  });

  // Get order by ID (kitchen/admin OR customer who owns it)
  app.get("/:id", {
    preHandler: [authenticate],
    schema: {
      tags: ["Orders"],
      description: "Get order by ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const order = await getOrderById(id);

      if (!order) {
        return reply.status(404).send({
          success: false,
          error: "Order not found",
        });
      }

      const userRole = request.user!.role;
      const isKitchenOrAdmin = ["KITCHEN", "ADMIN", "SUPERADMIN"].includes(userRole);
      const isOwner = order.userId === request.user!.userId;

      if (!isKitchenOrAdmin && !isOwner) {
        return reply.status(403).send({
          success: false,
          error: "Forbidden. You can only view your own orders.",
        });
      }

      reply.send({ success: true, data: order });
    },
  });

  // Public: Track order by ID + phone verification
  app.get("/:id/track", {
    schema: {
      tags: ["Orders"],
      description: "Track order by ID with phone verification",
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
      querystring: {
        type: "object",
        properties: {
          phone: { type: "string" },
        },
        required: ["phone"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const phone = (request.query as any).phone as string;

      if (!phone) {
        return reply.status(400).send({
          success: false,
          error: "Phone number is required",
        });
      }

      const order = await getOrderByIdAndPhone(id, phone);
      if (!order) {
        return reply.status(404).send({
          success: false,
          error: "Order not found",
        });
      }

      reply.send({ success: true, data: order });
    },
  });

  // Kitchen/Admin: Update order status
  app.patch("/:id/status", {
    preHandler: requireKitchen,
    schema: {
      tags: ["Orders"],
      description: "Update order status (kitchen/admin)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: [
              "RECEIVED",
              "ACCEPTED",
              "PREPARING",
              "READY",
              "PICKED_UP",
              "CANCELLED",
            ],
          },
          notes: { type: "string" },
        },
        required: ["status"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const data = updateStatusSchema.parse(request.body);
      const order = await updateOrderStatus(id, data);
      reply.send({ success: true, data: order });
    },
  });

  // Kitchen/Admin: Get order statistics
  app.get("/stats", {
    preHandler: requireKitchen,
    schema: {
      tags: ["Orders"],
      description: "Get order statistics (kitchen/admin)",
      security: [{ bearerAuth: [] }],
    },
    handler: async (_request, reply) => {
      const stats = await getOrderStats();
      reply.send({ success: true, data: stats });
    },
  });

  // Customer: Get my orders
  app.get("/me", {
    preHandler: [authenticate],
    schema: {
      tags: ["Orders"],
      description: "Get my orders (customer)",
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const orders = await getMyOrders(request.user!.userId);
      reply.send({ success: true, data: orders });
    },
  });
}
