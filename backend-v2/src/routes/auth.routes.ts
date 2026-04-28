import type { FastifyInstance } from "fastify";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from "../validations/auth.validation.js";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  getUserById,
} from "../services/auth.service.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { prisma } from "../utils/prisma.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Register
  app.post("/register", {
    schema: {
      tags: ["Auth"],
      description: "Register a new user",
      body: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          name: { type: "string", minLength: 2 },
          phone: { type: "string" },
          address: { type: "string" },
          role: { type: "string", enum: ["CUSTOMER", "KITCHEN", "ADMIN", "SUPERADMIN"] },
        },
        required: ["email", "password", "name"],
      },
    },
    handler: async (request, reply) => {
      try {
        const data = registerSchema.parse(request.body);
        const result = await registerUser(data);
        reply.status(201).send({ success: true, data: result });
      } catch (err: any) {
        // Handle Zod validation errors
        if (err.name === 'ZodError') {
          const issues = err.issues;
          const firstError = issues[0];
          let message = 'Datele introduse nu sunt valide';
          
          if (firstError?.path?.includes('email')) {
            message = 'Adresa de email nu este validă';
          } else if (firstError?.path?.includes('password')) {
            message = 'Parola trebuie să aibă minim 8 caractere';
          } else if (firstError?.path?.includes('name')) {
            message = 'Numele trebuie să aibă minim 2 caractere';
          }
          
          return reply.status(400).send({
            success: false,
            error: message,
            details: issues.map((i: any) => i.message),
          });
        }
        
        // Handle duplicate email error
        if (err.message?.includes('already registered') || err.statusCode === 409) {
          return reply.status(409).send({
            success: false,
            error: 'Email already registered',
          });
        }
        
        // Generic error
        return reply.status(500).send({
          success: false,
          error: 'Eroare la înregistrare. Încearcă din nou.',
        });
      }
    },
  });

  // Login
  app.post("/login", {
    schema: {
      tags: ["Auth"],
      description: "Login with email and password",
      body: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
    },
    handler: async (request, reply) => {
      try {
        const data = loginSchema.parse(request.body);
        const result = await loginUser(data);
        reply.send({ success: true, data: result });
      } catch (err: any) {
        // Handle Zod validation errors
        if (err.name === 'ZodError') {
          const issues = err.issues;
          return reply.status(400).send({
            success: false,
            error: 'Datele introduse nu sunt valide',
            details: issues.map((i: any) => i.message),
          });
        }
        
        // Handle authentication errors (401)
        if (err.statusCode === 401 || err.message?.includes('Invalid email or password')) {
          return reply.status(401).send({
            success: false,
            error: 'Email sau parolă incorecte',
          });
        }
        
        // Generic error
        console.error('Login error:', err);
        return reply.status(500).send({
          success: false,
          error: 'Eroare la autentificare. Încearcă din nou.',
        });
      }
    },
  });

  // PIN Login (for Store module)
  app.post("/pin-login", {
    schema: {
      tags: ["Auth"],
      description: "Login with PIN for store/kitchen users",
      body: {
        type: "object",
        properties: {
          pin: { type: "string", minLength: 4, maxLength: 10 },
        },
        required: ["pin"],
      },
    },
    handler: async (request, reply) => {
      const { pin } = request.body as { pin: string };

      const user = await prisma.user.findFirst({
        where: {
          pin,
          role: { in: ["KITCHEN", "ADMIN", "SUPERADMIN"] },
          isActive: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: "Invalid PIN",
        });
      }

      const { generateAccessToken, generateRefreshToken } = await import("../utils/jwt.js");
      const payload = { userId: user.id, email: user.email, role: user.role };
      const refreshPayload = { userId: user.id };

      reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken: generateAccessToken(payload),
          refreshToken: generateRefreshToken(refreshPayload),
        },
      });
    },
  });

  // Refresh token
  app.post("/refresh", {
    schema: {
      tags: ["Auth"],
      description: "Refresh access token",
      body: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
        required: ["refreshToken"],
      },
    },
    handler: async (request, reply) => {
      const data = refreshSchema.parse(request.body);
      const result = await refreshAccessToken(data.refreshToken);
      reply.send({ success: true, data: result });
    },
  });

  // Get current user
  app.get("/me", {
    preHandler: [authenticate],
    schema: {
      tags: ["Auth"],
      description: "Get current authenticated user",
      security: [{ bearerAuth: [] }],
    },
    handler: async (request, reply) => {
      const user = await getUserById(request.user!.userId);
      reply.send({ success: true, data: user });
    },
  });

  // List users (admin only)
  app.get("/users", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Auth"],
      description: "List all users (admin only)",
      security: [{ bearerAuth: [] }],
    },
    handler: async (_request, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      reply.send({ success: true, data: users });
    },
  });

  // Update user (admin only)
  app.put("/users/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Auth"],
      description: "Update user (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          address: { type: "string" },
          role: { type: "string", enum: ["CUSTOMER", "KITCHEN", "ADMIN", "SUPERADMIN"] },
        },
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const body = request.body as any;

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.email && { email: body.email }),
          ...(body.phone && { phone: body.phone }),
          ...(body.address && { address: body.address }),
          ...(body.role && { role: body.role }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          address: true,
          isActive: true,
          createdAt: true,
        },
      });

      reply.send({ success: true, data: user });
    },
  });

  // Toggle user active status (admin only)
  app.patch("/users/:id/status", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Auth"],
      description: "Toggle user active status (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
        required: ["isActive"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      const { isActive } = request.body as { isActive: boolean };

      const user = await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      reply.send({ success: true, data: user });
    },
  });

  // Delete user (admin only)
  app.delete("/users/:id", {
    preHandler: requireAdmin,
    schema: {
      tags: ["Auth"],
      description: "Delete user (admin only)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: { id: { type: "integer" } },
        required: ["id"],
      },
    },
    handler: async (request, reply) => {
      const id = Number((request.params as any).id);
      await prisma.user.delete({ where: { id } });
      reply.send({ success: true, message: "User deleted" });
    },
  });
}
