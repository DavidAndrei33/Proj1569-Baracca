import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/auth.js";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream";
import util from "node:util";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

const pump = util.promisify(pipeline);

export async function uploadRoutes(app: FastifyInstance) {
  // Upload product image
  app.post("/", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      try {
        const data = await request.file({
          limits: {
            fileSize: env.UPLOAD_MAX_SIZE, // 5MB
          },
        });

        if (!data) {
          return reply.status(400).send({
            success: false,
            error: "No file uploaded",
          });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(data.mimetype)) {
          return reply.status(400).send({
            success: false,
            error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
          });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = path.extname(data.filename) || ".jpg";
        const filename = `product-${timestamp}-${random}${extension}`;

        // Ensure upload directory exists
        const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Save file
        await pump(data.file, fs.createWriteStream(filePath));

        // Return URL
        const fileUrl = `/uploads/${filename}`;

        logger.info(`File uploaded: ${filename} (${data.mimetype})`);

        return reply.send({
          success: true,
          data: {
            url: fileUrl,
            filename,
            originalName: data.filename,
            size: data.file.bytesRead,
          },
        });
      } catch (err) {
        logger.error("Upload error:" + String(err));
        return reply.status(500).send({
          success: false,
          error: "Failed to upload file",
        });
      }
    },
  });

  // Delete uploaded image
  app.delete("/:filename", {
    preHandler: [authenticate],
    handler: async (request, reply) => {
      try {
        const { filename } = request.params as { filename: string };
        
        // Security: prevent path traversal
        const sanitized = path.basename(filename);
        const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
        const filePath = path.join(uploadDir, sanitized);

        // Ensure file is within upload directory
        if (!filePath.startsWith(uploadDir)) {
          return reply.status(403).send({
            success: false,
            error: "Invalid filename",
          });
        }

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`File deleted: ${sanitized}`);
        }

        return reply.send({
          success: true,
          message: "File deleted",
        });
      } catch (err) {
        logger.error("Delete error:" + String(err));
        return reply.status(500).send({
          success: false,
          error: "Failed to delete file",
        });
      }
    },
  });
}
