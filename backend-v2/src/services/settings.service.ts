import { prisma } from "../utils/prisma.js";
import { getCache, setCache, delCache } from "../utils/cache.js";
import type { SettingInput, BusinessHourInput } from "../validations/settings.validation.js";

const CACHE_KEYS = {
  SETTINGS: "settings:all",
  BUSINESS_HOURS: "business_hours:all",
};

// Settings
export async function getSettings() {
  const cached = await getCache(CACHE_KEYS.SETTINGS);
  if (cached) return cached;

  const settings = await prisma.setting.findMany({
    orderBy: { key: "asc" },
  });
  const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  await setCache(CACHE_KEYS.SETTINGS, result, 3600);
  return result;
}

export async function getSettingByKey(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function upsertSetting(data: SettingInput) {
  const setting = await prisma.setting.upsert({
    where: { key: data.key },
    update: { value: data.value },
    create: data,
  });
  await delCache(CACHE_KEYS.SETTINGS);
  return setting;
}

// Business Hours
export async function getBusinessHours() {
  const cached = await getCache(CACHE_KEYS.BUSINESS_HOURS);
  if (cached) return cached;

  const hours = await prisma.businessHour.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  await setCache(CACHE_KEYS.BUSINESS_HOURS, hours, 3600);
  return hours;
}

export async function getBusinessHourByDay(dayOfWeek: number) {
  return prisma.businessHour.findUnique({
    where: { dayOfWeek },
  });
}

export async function upsertBusinessHour(data: BusinessHourInput) {
  const hour = await prisma.businessHour.upsert({
    where: { dayOfWeek: data.dayOfWeek },
    update: {
      openTime: data.openTime,
      closeTime: data.closeTime,
      isClosed: data.isClosed,
    },
    create: data,
  });
  await delCache(CACHE_KEYS.BUSINESS_HOURS);
  return hour;
}

export function isStoreOpen(
  hours: Awaited<ReturnType<typeof getBusinessHours>>,
  date = new Date()
): boolean {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const currentTime = hour * 60 + minute;

  const dayHours = hours.find((h: { dayOfWeek: number; isClosed: boolean; openTime: string; closeTime: string }) => h.dayOfWeek === dayOfWeek);
  if (!dayHours || dayHours.isClosed) return false;

  const [openH, openM] = dayHours.openTime.split(":").map(Number);
  const [closeH, closeM] = dayHours.closeTime.split(":").map(Number);
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  return currentTime >= openTime && currentTime <= closeTime;
}
