import { nanoid } from "nanoid";
import { getRedisClient } from "./redis";

export interface PasteData {
  content: string;
  ttlSeconds?: number;
  maxViews?: number;
}

export interface StoredPaste {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  viewCount: number;
}

export interface PasteResponse {
  content: string;
  remainingViews: number | null;
  expiresAt: string | null;
}

export function getCurrentTime(testNowMs?: string): number {
  if (process.env.TEST_MODE === "1" && testNowMs) {
    return parseInt(testNowMs, 10);
  }
  if (process.env.TEST_MODE === "1" && process.env.TEST_NOW_MS) {
    return parseInt(process.env.TEST_NOW_MS, 10);
  }
  return Date.now();
}

export function generatePasteId(): string {
  return nanoid(10);
}

export async function createPaste(
  data: PasteData,
): Promise<{ id: string; url: string }> {
  const redis = getRedisClient();
  const id = generatePasteId();
  const now = getCurrentTime();

  const paste: StoredPaste = {
    id,
    content: data.content,
    createdAt: now,
    expiresAt: data.ttlSeconds ? now + data.ttlSeconds * 1000 : null,
    maxViews: data.maxViews ?? null,
    viewCount: 0,
  };

  const key = `paste:${id}`;
  await redis.set(key, JSON.stringify(paste));

  if (data.ttlSeconds) {
    await redis.expire(key, data.ttlSeconds);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return {
    id,
    url: `${baseUrl}/p/${id}`,
  };
}

export async function getPaste(
  id: string,
  incrementView = false,
  testNowMs?: string,
): Promise<PasteResponse | null> {
  const redis = getRedisClient();
  const key = `paste:${id}`;

  const data = await redis.get(key);
  if (!data) {
    return null;
  }

  const paste: StoredPaste = JSON.parse(data);
  const now = getCurrentTime(testNowMs);

  if (paste.expiresAt && now >= paste.expiresAt) {
    await redis.del(key);
    return null;
  }

  if (paste.maxViews !== null && paste.viewCount >= paste.maxViews) {
    await redis.del(key);
    return null;
  }

  let currentViewCount = paste.viewCount;

  if (incrementView) {
    currentViewCount += 1;
    paste.viewCount = currentViewCount;

    if (paste.maxViews !== null && currentViewCount >= paste.maxViews) {
      await redis.del(key);
    } else {
      await redis.set(key, JSON.stringify(paste));
      if (paste.expiresAt) {
        const ttl = Math.max(0, Math.ceil((paste.expiresAt - now) / 1000));
        await redis.expire(key, ttl);
      }
    }
  }

  const remainingViews =
    paste.maxViews !== null ? paste.maxViews - currentViewCount : null;

  return {
    content: paste.content,
    remainingViews,
    expiresAt: paste.expiresAt ? new Date(paste.expiresAt).toISOString() : null,
  };
}

export function validatePasteData(data: any): {
  valid: boolean;
  error?: string;
} {
  if (
    !data.content ||
    typeof data.content !== "string" ||
    data.content.trim() === ""
  ) {
    return {
      valid: false,
      error: "Content is required and must be a non-empty string",
    };
  }

  if (data.ttlSeconds !== undefined) {
    if (!Number.isInteger(data.ttlSeconds) || data.ttlSeconds < 1) {
      return { valid: false, error: "ttl_seconds must be an integer >= 1" };
    }
  }

  if (data.maxViews !== undefined) {
    if (!Number.isInteger(data.maxViews) || data.maxViews < 1) {
      return { valid: false, error: "max_views must be an integer >= 1" };
    }
  }

  return { valid: true };
}
