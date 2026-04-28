import type { FastifyInstance } from "fastify";
import { authenticate, authorize } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";
import { publishOrderEvent } from "../utils/events.js";

export async function reservationRoutes(app: FastifyInstance): Promise<void> {
  // Public: Create reservation
  app.post("/", {
    schema: {
      tags: ["Reservations"],
      description: "Create a new reservation",
      body: {
        type: "object",
        properties: {
          customerName: { type: "string", minLength: 2 },
          customerPhone: { type: "string", minLength: 5 },
          customerEmail: { type: "string" },
          reservationDate: { type: "string", format: "date" },
          reservationTime: { type: "string" },
          numberOfGuests: { type: "integer", minimum: 1, maximum: 50 },
          tablePreference: { type: "string" },
          occasion: { type: "string" },
          specialRequests: { type: "string" },
        },
        required: ["customerName", "customerPhone", "reservationDate", "reservationTime", "numberOfGuests"],
      },
    },
    handler: async (request, reply) => {
      const body = request.body as any;
      const reservation = await prisma.reservation.create({
        data: {
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          customerEmail: body.customerEmail || null,
          reservationDate: new Date(body.reservationDate),
          reservationTime: body.reservationTime,
          numberOfGuests: body.numberOfGuests,
          tablePreference: body.tablePreference || null,
          occasion: body.occasion || null,
          specialRequests: body.specialRequests || null,
        },
      });

      publishOrderEvent({
        type: "RESERVATION_CREATED",
        reservationId: reservation.id,
        status: reservation.status,
        timestamp: new Date().toISOString(),
        data: {
          customerName: reservation.customerName,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          numberOfGuests: reservation.numberOfGuests,
        },
      });

      reply.status(201).send({ success: true, data: reservation });
    },
  });

  // Kitchen/Admin: List reservations
  app.get("/", {
    preHandler: [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "List reservations with filters",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          date: { type: "string" },
          status: { type: "string" },
          page: { type: "integer", minimum: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
      },
    },
    handler: async (request, reply) => {
      const query = request.query as any;
      const where: any = {};

      if (query.date) {
        where.reservationDate = new Date(query.date);
      }
      if (query.status) {
        where.status = query.status;
      }

      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 20;
      const skip = (page - 1) * limit;

      const [reservations, total] = await Promise.all([
        prisma.reservation.findMany({
          where,
          include: { table: true },
          orderBy: { reservationTime: "asc" },
          skip,
          take: limit,
        }),
        prisma.reservation.count({ where }),
      ]);

      reply.send({
        success: true,
        data: {
          reservations,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
      });
    },
  });

  // Kitchen/Admin: Get reservation by ID
  app.get("/:id", {
    preHandler: [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "Get reservation by ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: { table: true },
      });

      if (!reservation) {
        return reply.status(404).send({ success: false, error: "Reservation not found" });
      }

      reply.send({ success: true, data: reservation });
    },
  });

  // Kitchen/Admin: Update reservation
  app.patch("/:id", {
    preHandler: [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "Update reservation",
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
      if (body.status !== undefined) data.status = body.status;
      if (body.tableId !== undefined) data.tableId = body.tableId;
      if (body.customerName !== undefined) data.customerName = body.customerName;
      if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone;
      if (body.numberOfGuests !== undefined) data.numberOfGuests = body.numberOfGuests;
      if (body.specialRequests !== undefined) data.specialRequests = body.specialRequests;

      const reservation = await prisma.reservation.update({
        where: { id },
        data,
        include: { table: true },
      });

      publishOrderEvent({
        type: "RESERVATION_UPDATED",
        reservationId: reservation.id,
        status: reservation.status,
        timestamp: new Date().toISOString(),
      });

      reply.send({ success: true, data: reservation });
    },
  });

  // Kitchen/Admin: Update reservation status (for Store KDS)
  app.patch("/:id/status", {
    preHandler: [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "Update reservation status",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"] },
        },
        required: ["status"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const { status } = request.body as { status: any };

      const reservation = await prisma.reservation.update({
        where: { id },
        data: { status: status as any },
        include: { table: true },
      });

      publishOrderEvent({
        type: "RESERVATION_UPDATED",
        reservationId: reservation.id,
        status: reservation.status,
        timestamp: new Date().toISOString(),
      });

      reply.send({ success: true, data: reservation });
    },
  });

  // Admin: Delete reservation
  app.delete("/:id", {
    preHandler: [authenticate, authorize("ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "Delete reservation",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      await prisma.reservation.delete({ where: { id } });
      reply.send({ success: true, message: "Reservation deleted" });
    },
  });

  // Kitchen/Admin: Reservation stats
  app.get("/stats/summary", {
    preHandler: [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")],
    schema: {
      tags: ["Reservations"],
      description: "Get reservation statistics",
      security: [{ bearerAuth: [] }],
    },
    handler: async (_request, reply) => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const [
        totalReservations,
        todayReservations,
        pendingReservations,
        confirmedReservations,
      ] = await Promise.all([
        prisma.reservation.count(),
        prisma.reservation.count({ where: { reservationDate: { gte: todayStart, lt: todayEnd } } }),
        prisma.reservation.count({ where: { status: "PENDING" } }),
        prisma.reservation.count({ where: { status: "CONFIRMED" } }),
      ]);

      reply.send({
        success: true,
        data: {
          totalReservations,
          todayReservations,
          pendingReservations,
          confirmedReservations,
        },
      });
    },
  });
}
