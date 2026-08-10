// In-memory fallback database for caching and rate limiting
const memoryDb: Record<string, { count: number; expiresAt: number }> = {};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Checks if a specific key (IP + path) has exceeded limits.
 * Simple, robust rate limiter that works instantly without external Redis setup,
 * but can be easily swapped or extended.
 */
export async function rateLimit(
  key: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now();
  const record = memoryDb[key];

  if (!record || record.expiresAt < now) {
    // Create new window
    memoryDb[key] = {
      count: 1,
      expiresAt: now + windowMs,
    };
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.expiresAt / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil(record.expiresAt / 1000),
  };
}

/**
 * Audit Logger utility
 */
import { prisma } from "./prisma";

export async function logAction(
  action: string,
  message: string,
  appId: string | null = null,
  ip: string | null = null,
  hwid: string | null = null
) {
  try {
    await prisma.log.create({
      data: {
        action,
        message,
        appId,
        ip,
        hwid,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
