import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getTestApp, closeTestApp } from "../helpers.js";
import type { FastifyInstance } from "fastify";

describe("Auth Routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await getTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  it("POST /api/auth/register - creates a new user", async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: {
        email: uniqueEmail,
        password: "Test123!",
        name: "Integration Test",
        phone: "0711111111",
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe(uniqueEmail);
    expect(body.data.accessToken).toBeDefined();
  });

  it("POST /api/auth/login - returns tokens for valid credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@rotiserie.ro", password: "admin123" },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  it("POST /api/auth/login - rejects invalid credentials", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@rotiserie.ro", password: "wrongpassword" },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(false);
  });

  it("GET /api/auth/me - returns user data with valid token", async () => {
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "admin@rotiserie.ro", password: "admin123" },
    });
    const token = JSON.parse(login.payload).data.accessToken;

    const res = await app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("admin@rotiserie.ro");
  });

  it("GET /api/auth/me - rejects without token", async () => {
    const res = await app.inject({ method: "GET", url: "/api/auth/me" });
    expect(res.statusCode).toBe(401);
  });
});
