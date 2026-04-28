import { describe, it, expect } from "vitest";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  type TokenPayload,
} from "../../src/utils/jwt.js";

describe("JWT Utils", () => {
  const payload: TokenPayload = {
    userId: 1,
    email: "test@example.com",
    role: "CUSTOMER",
  };

  it("generates and verifies access token", () => {
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("generates and verifies refresh token", () => {
    const token = generateRefreshToken({ userId: 1 });
    expect(token).toBeDefined();

    const decoded = verifyRefreshToken(token);
    expect(decoded.userId).toBe(1);
  });

  it("throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
