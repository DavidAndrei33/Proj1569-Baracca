import { beforeAll, afterAll } from "vitest";
import { prisma } from "../src/utils/prisma.js";

beforeAll(async () => {
  // Ensure test database is clean
});

afterAll(async () => {
  await prisma.$disconnect();
});
