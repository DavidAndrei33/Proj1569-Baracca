import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestApp, closeTestApp, loginAsAdmin } from "../helpers.js";
import type { FastifyInstance } from "fastify";

describe("Product Routes", () => {
  let app: FastifyInstance;
  let adminToken: string;

  beforeAll(async () => {
    app = await getTestApp();
    adminToken = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it("GET /api/products - returns public product list", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.products)).toBe(true);
    expect(body.data.pagination).toBeDefined();
  });

  it("GET /api/products?category=pizza - filters by category", async () => {
    const res = await app.inject({ method: "GET", url: "/api/products?category=pizza" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
  });

  it("GET /api/categories - returns all categories", async () => {
    const res = await app.inject({ method: "GET", url: "/api/categories" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
