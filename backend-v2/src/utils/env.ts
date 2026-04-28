import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("5156"),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().default("postgresql://proj1566:parola_ta_puternica@localhost:5432/proj1566_db"),
  DIRECT_URL: z.string().default("postgresql://proj1566:parola_ta_puternica@localhost:5432/proj1566_db"),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  JWT_SECRET: z.string().default("cheie_secreta_lunga_aici_minim_32_caractere"),
  JWT_ACCESS_EXPIRATION: z.string().default("15m"),
  JWT_REFRESH_EXPIRATION: z.string().default("7d"),

  CORS_ORIGIN: z.string().default("*"),
  RATE_LIMIT_MAX: z.string().transform(Number).default("100"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("60000"),

  UPLOAD_MAX_SIZE: z.string().transform(Number).default("5242880"),
  UPLOAD_DIR: z.string().default("./uploads"),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CURRENCY: z.string().default("ron"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn("Warning: Environment variables not set, using defaults");
  console.warn(parsed.error.issues);
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: "production" as const,
  PORT: 5156,
  HOST: "0.0.0.0",
  DATABASE_URL: "postgresql://proj1566:parola_ta_puternica@localhost:5432/proj1566_db",
  DIRECT_URL: "postgresql://proj1566:parola_ta_puternica@localhost:5432/proj1566_db",
  REDIS_URL: "redis://localhost:6379",
  JWT_SECRET: "cheie_secreta_lunga_aici_minim_32_caractere",
  JWT_ACCESS_EXPIRATION: "15m",
  JWT_REFRESH_EXPIRATION: "7d",
  CORS_ORIGIN: "*",
  RATE_LIMIT_MAX: 100,
  RATE_LIMIT_WINDOW_MS: 60000,
  UPLOAD_MAX_SIZE: 5242880,
  UPLOAD_DIR: "./uploads",
  STRIPE_SECRET_KEY: undefined,
  STRIPE_WEBHOOK_SECRET: undefined,
  STRIPE_CURRENCY: "ron"
};
