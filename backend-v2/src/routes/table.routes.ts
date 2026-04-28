import type { FastifyInstance } from "fastify";
import { authenticate, authorize } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";

export async function tableRoutes(app: FastifyInstance): Promise<void> {
  // Public: List tables (with current reservations)
  app.get("/", {
    schema: {
      tags: ["Tables"],
      description: "List all tables with reservation info",
    },
    handler: async (_request, reply) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const tables = await prisma.table.findMany({
        where: { isActive: true },
        include: {
          reservations: {
            where: {
              reservationDate: { gte: today, lt: tomorrow },
              status: { in: ["PENDING", "CONFIRMED"] },
            },
            orderBy: { reservationTime: "asc" },
          },
        },
        orderBy: { tableNumber: "asc" },
      });

      reply.send({ success: true, data: tables });
    },
  });

  // Admin: Create table
  app.post("/", {
    preHandler: [authenticate, authorize("ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Tables"],
      description: "Create a new table",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          tableNumber: { type: "string", minLength: 1 },
          capacity: { type: "integer", minimum: 1 },
          location: { type: "string" },
        },
        required: ["tableNumber", "capacity", "location"],
      },
    },
    handler: async (request, reply) => {
      const body = request.body as any;
      const table = await prisma.table.create({
        data: {
          tableNumber: body.tableNumber,
          capacity: body.capacity,
          location: body.location,
        },
      });
      reply.status(201).send({ success: true, data: table });
    },
  });

  // Admin: Update table
  app.patch("/:id", {
    preHandler: [authenticate, authorize("ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Tables"],
      description: "Update table",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const body = request.body as any;

      const data: any = {};
      if (body.tableNumber !== undefined) data.tableNumber = body.tableNumber;
      if (body.capacity !== undefined) data.capacity = body.capacity;
      if (body.location !== undefined) data.location = body.location;
      if (body.isActive !== undefined) data.isActive = body.isActive;

      const table = await prisma.table.update({
        where: { id },
        data,
      });

      reply.send({ success: true, data: table });
    },
  });

  // Admin: Delete table
  app.delete("/:id", {
    preHandler: [authenticate, authorize("ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Tables"],
      description: "Delete table",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      await prisma.table.delete({ where: { id } });
      reply.send({ success: true, message: "Table deleted" });
    },
  });
}
