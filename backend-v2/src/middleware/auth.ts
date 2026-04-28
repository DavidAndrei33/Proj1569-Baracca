import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "../utils/jwt.js";
import { prisma } from "../utils/prisma.js";
import type { TokenPayload } from "../utils/jwt.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      success: false,
      error: "Unauthorized. Bearer token required.",
    });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized. User inactive or deleted.",
      });
    }

    request.user = payload;
  } catch {
    return reply.status(401).send({
      success: false,
      error: "Unauthorized. Invalid or expired token.",
    });
  }
}

export function authorize(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized. Authentication required.",
      });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        error: `Forbidden. Required role: ${roles.join(" or ")}.`,
      });
    }
  };
}

export const requireAuth = authenticate;
export const requireAdmin = [authenticate, authorize("ADMIN", "SUPERADMIN")];
export const requireKitchen = [authenticate, authorize("KITCHEN", "ADMIN", "SUPERADMIN")];
