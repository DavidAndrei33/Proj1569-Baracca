import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/auth.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "../validations/product.validation.js";

export async function productRoutes(app: FastifyInstance): Promise<void> {
  // Public: List products
  app.get("/", {
    schema: {
      tags: ["Products"],
      description: "List products with filters",
      querystring: {
        type: "object",
        properties: {
          category: { type: "string" },
          featured: { type: "boolean" },
          search: { type: "string" },
          all: { type: "boolean" },
          page: { type: "integer", minimum: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100 },
        },
      },
    },
    handler: async (request, reply) => {
      const query = productQuerySchema.parse(request.query);
      const isAdmin =
        request.user?.role === "ADMIN" || request.user?.role === "SUPERADMIN";
      const result = await getProducts(query, isAdmin || query.all === true);
      reply.send({ success: true, data: result });
    },
  });

  // Public: Get product by ID
  app.get("/:id", {
    schema: {
      tags: ["Products"],
      description: "Get product by ID",
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const product = await getProductById(id);
      if (!product || !product.isAvailable) {
        return reply.status(404).send({
          success: false,
          error: "Product not found",
        });
      }
      reply.send({ success: true, data: product });
    },
  });

  // Admin: Create product
  app.post("/", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Products"],
      description: "Create a new product (admin only)",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          categoryId: { type: "integer" },
          isFeatured: { type: "boolean" },
          isAvailable: { type: "boolean" },
          sortOrder: { type: "integer" },
        },
        required: ["name", "price", "categoryId"],
      },
    },
    handler: async (request, reply) => {
      const data = createProductSchema.parse(request.body);
      const product = await createProduct(data);
      reply.status(201).send({ success: true, data: product });
    },
  });

  // Admin: Update product
  app.put("/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Products"],
      description: "Update product (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const data = updateProductSchema.parse(request.body);
      const product = await updateProduct(id, data);
      reply.send({ success: true, data: product });
    },
  });

  // Admin: Delete product (soft delete)
  app.delete("/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Products"],
      description: "Delete product (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      await deleteProduct(id);
      reply.send({ success: true, message: "Product deleted" });
    },
  });
}
