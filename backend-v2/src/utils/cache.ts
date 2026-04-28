import { redis } from "./redis.js";
import { logger } from "./logger.js";

const DEFAULT_TTL = 300; // 5 minutes

export async function getCache(key: string): Promise<any> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn({ err, key }, "Cache get error");
  }
  return null;
}

export async function setCache(key: string, value: any, ttl = DEFAULT_TTL): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.warn({ err, key }, "Cache set error");
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn({ err, key }, "Cache del error");
  }
}

export async function delCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn({ err, pattern }, "Cache del pattern error");
  }
}
