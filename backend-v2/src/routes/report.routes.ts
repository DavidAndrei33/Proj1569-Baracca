import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/auth.js";
import {
  getSummaryStats,
  getCategorySales,
  getMonthlyRevenue,
  getTopProducts,
} from "../services/report.service.js";

export async function reportRoutes(app: FastifyInstance): Promise<void> {
  // Summary stats (admin only)
  app.get("/summary", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Reports"],
      description: "Get summary statistics",
      security: [{ bearerAuth: [] }],
    },
    handler: async (_request, reply) => {
      const data = await getSummaryStats();
      reply.send({ success: true, data });
    },
  });

  // Category sales distribution (admin only)
  app.get("/category-sales", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Reports"],
      description: "Get sales by category",
      security: [{ bearerAuth: [] }],
    },
    handler: async (_request, reply) => {
      const data = await getCategorySales();
      reply.send({ success: true, data });
    },
  });

  // Monthly revenue (admin only)
  app.get("/monthly-revenue", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Reports"],
      description: "Get monthly revenue and orders",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          months: { type: "integer", minimum: 1, maximum: 24 },
        },
      },
    },
    handler: async (request, reply) => {
      const months = Number((request.query as any).months) || 6;
      const data = await getMonthlyRevenue(months);
      reply.send({ success: true, data });
    },
  });

  // Top products (admin only)
  app.get("/top-products", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Reports"],
      description: "Get top selling products",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          limit: { type: "integer", minimum: 1, maximum: 20 },
        },
      },
    },
    handler: async (request, reply) => {
      const limit = Number((request.query as any).limit) || 5;
      const data = await getTopProducts(limit);
      reply.send({ success: true, data });
    },
  });
}
