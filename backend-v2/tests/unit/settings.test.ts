import { describe, it, expect } from "vitest";
import { isStoreOpen } from "../../src/services/settings.service.js";

describe("isStoreOpen", () => {
  const hours = [
    { dayOfWeek: 1, openTime: "10:00", closeTime: "22:00", isClosed: false },
    { dayOfWeek: 2, openTime: "10:00", closeTime: "22:00", isClosed: false },
    { dayOfWeek: 4, openTime: "10:00", closeTime: "22:00", isClosed: false },
    { dayOfWeek: 0, openTime: "10:00", closeTime: "22:00", isClosed: true },
  ];

  it("returns true when within business hours", () => {
    const date = new Date("2026-04-23T14:00:00"); // Thursday
    expect(isStoreOpen(hours, date)).toBe(true);
  });

  it("returns false when outside business hours", () => {
    const date = new Date("2026-04-23T08:00:00"); // Thursday before open
    expect(isStoreOpen(hours, date)).toBe(false);
  });

  it("returns false when day is closed", () => {
    const date = new Date("2026-04-19T14:00:00");
    expect(isStoreOpen(hours, date)).toBe(false);
  });

  it("returns false when day not found in schedule", () => {
    const date = new Date("2026-04-23T14:00:00");
    expect(isStoreOpen([], date)).toBe(false);
  });
});
