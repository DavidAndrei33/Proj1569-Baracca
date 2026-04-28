import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(100),
});

export const createOrderSchema = z.object({
  orderType: z.enum(["TAKEAWAY", "DINE_IN"]).optional().default("TAKEAWAY"),
  customerName: z.string().min(2).max(200),
  customerPhone: z.string().min(5).max(20),
  customerAddress: z.string().min(5).max(500).optional(),
  pickupTime: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  paymentMethod: z.enum(["cash", "card", "online"]),
  notes: z.string().max(1000).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum([
    "RECEIVED",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "PICKED_UP",
    "CANCELLED",
  ]),
  notes: z.string().max(500).optional(),
});

export const orderQuerySchema = z.object({
  status: z.string().optional(),
  phone: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
