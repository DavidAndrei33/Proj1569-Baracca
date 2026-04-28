import type { FastifyInstance } from "fastify";
import { requireAdmin } from "../middleware/auth.js";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/product.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/product.validation.js";

export async function categoryRoutes(app: FastifyInstance): Promise<void> {
  // Public: List categories
  app.get("/", {
    schema: {
      tags: ["Categories"],
      description: "List all active categories",
    },
    handler: async (_request, reply) => {
      const categories = await getCategories();
      reply.send({ success: true, data: categories });
    },
  });

  // Public: Get category by ID
  app.get("/:id", {
    schema: {
      tags: ["Categories"],
      description: "Get category by ID",
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const category = await getCategoryById(id);
      if (!category) {
        return reply.status(404).send({
          success: false,
          error: "Category not found",
        });
      }
      reply.send({ success: true, data: category });
    },
  });

  // Admin: Create category
  app.post("/", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Categories"],
      description: "Create a new category (admin only)",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          slug: { type: "string", minLength: 2 },
          description: { type: "string" },
          sortOrder: { type: "integer" },
        },
        required: ["name", "slug"],
      },
    },
    handler: async (request, reply) => {
      const data = createCategorySchema.parse(request.body);
      const category = await createCategory(data);
      reply.status(201).send({ success: true, data: category });
    },
  });

  // Admin: Update category
  app.put("/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Categories"],
      description: "Update category (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const data = updateCategorySchema.parse(request.body);
      const category = await updateCategory(id, data);
      reply.send({ success: true, data: category });
    },
  });

  // Admin: Delete category (soft delete)
  app.delete("/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Categories"],
      description: "Delete category (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      await deleteCategory(id);
      reply.send({ success: true, message: "Category deleted" });
    },
  });
}
