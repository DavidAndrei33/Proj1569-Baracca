import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/auth.js";
import {
  getSettings,
  upsertSetting,
  getBusinessHours,
  upsertBusinessHour,
  isStoreOpen,
} from "../services/settings.service.js";
import { businessHourSchema } from "../validations/settings.validation.js";

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // Public: Get all settings
  app.get("/", {
    schema: {
      tags: ["Settings"],
      description: "Get all settings",
    },
    handler: async (_request, reply) => {
      const settings = await getSettings();
      reply.send({ success: true, data: settings });
    },
  });

  // Admin: Update setting
  app.put("/:key", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Settings"],
      description: "Update a setting (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { key: { type: "string" } },
        required: ["key"],
      },
      body: {
        type: "object",
        properties: {
          value: { type: "string" },
        },
        required: ["value"],
      },
    },
    handler: async (request, reply) => {
      const key = (request.params as any).key as string;
      const { value } = request.body as { value: string };
      const setting = await upsertSetting({ key, value });
      reply.send({ success: true, data: setting });
    },
  });

  // Public: Get business hours
  app.get("/business-hours", {
    schema: {
      tags: ["Settings"],
      description: "Get business hours",
    },
    handler: async (_request, reply) => {
      const hours = await getBusinessHours();
      reply.send({ success: true, data: hours });
    },
  });

  // Public: Check if store is open
  app.get("/business-hours/check", {
    schema: {
      tags: ["Settings"],
      description: "Check if store is currently open",
    },
    handler: async (_request, reply) => {
      const hours = await getBusinessHours();
      const open = isStoreOpen(hours);
      reply.send({
        success: true,
        data: { isOpen: open, now: new Date().toISOString() },
      });
    },
  });

  // Admin: Update business hours
  app.put("/business-hours/:day", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Settings"],
      description: "Update business hours for a day (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { day: { type: "integer", minimum: 0, maximum: 6 } },
        required: ["day"],
      },
      body: {
        type: "object",
        properties: {
          openTime: { type: "string", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" },
          closeTime: { type: "string", pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$" },
          isClosed: { type: "boolean" },
        },
        required: ["openTime", "closeTime"],
      },
    },
    handler: async (request, reply) => {
      const dayOfWeek = Number((request.params as any).day);
      const body = businessHourSchema.parse({
        ...(request.body as any),
        dayOfWeek,
      });
      const hour = await upsertBusinessHour(body);
      reply.send({ success: true, data: hour });
    },
  });
}
