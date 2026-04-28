import type { FastifyInstance } from "fastify";
import { isStripeEnabled, createPaymentIntent, retrievePaymentIntent } from "../services/payment.service.js";
import { authenticate } from "../middleware/auth.js";

const disabledResponse = {
  success: false,
  error: "Platile cu cardul vor fi disponibile in curand.",
};

export async function paymentRoutes(app: FastifyInstance): Promise<void> {
  app.post("/intent", {
    preHandler: authenticate,
    schema: {
      tags: ["Payments"],
      description: "Create Stripe PaymentIntent",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          amount: { type: "number", minimum: 0.01 },
          currency: { type: "string", default: "ron" },
        },
        required: ["amount"],
      },
    },
    handler: async (request, reply) => {
      if (!isStripeEnabled) {
        return reply.status(503).send(disabledResponse);
      }
      const { amount, currency } = request.body as { amount: number; currency?: string };
      const intent = await createPaymentIntent(amount, currency);
      return reply.send({ success: true, data: { clientSecret: intent.client_secret, id: intent.id } });
    },
  });

  app.get("/intent/:id", {
    preHandler: authenticate,
    schema: {
      tags: ["Payments"],
      description: "Retrieve PaymentIntent status",
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      if (!isStripeEnabled) {
        return reply.status(503).send(disabledResponse);
      }
      const { id } = request.params as { id: string };
      const intent = await retrievePaymentIntent(id);
      return reply.send({ success: true, data: intent });
    },
  });

  app.post("/webhook", {
    config: { rawBody: true },
    schema: {
      tags: ["Payments"],
      description: "Stripe webhook handler",
    },
    handler: async (_request, reply) => {
      if (!isStripeEnabled) {
        return reply.status(503).send(disabledResponse);
      }
      return reply.status(501).send({ success: false, error: "Webhook handler not yet implemented" });
    },
  });
}
