import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { reportError } from "@/lib/monitoring";

export type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
  /**
   * Behavior when Redis is unavailable or throws an error.
   * - 'fail-closed': Enforces local memory limits and rejects requests when exceeded.
   * - 'fail-open': Allows request up to memory limit before enforcing.
   * @default 'fail-closed'
   */
  fallbackPolicy?: "fail-closed" | "fail-open";
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

const limitersMap = new Map<string, Ratelimit>();

/**
 * Local in-memory sliding window rate limiter used as a fallback when Upstash Redis
 * is unconfigured or unavailable.
 *
 * NOTE: This is NOT distributed rate limiting across serverless instances and is intended
 * solely as a single-instance degraded-mode safety net.
 */
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

export function checkInMemoryFallback(
  key: string,
  maxRequests: number,
  windowMs: number,
  fallbackPolicy: "fail-closed" | "fail-open" = "fail-closed"
): RateLimitResult {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (!record || record.resetAt < now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: fallbackPolicy === "fail-open",
      limit: maxRequests,
      remaining: 0,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
    resetMs: Math.max(0, record.resetAt - now),
  };
}

function getRedisInstance(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  try {
    return new Redis({ url, token });
  } catch (err) {
    console.warn("Failed to instantiate Upstash Redis client:", err);
    return null;
  }
}

function getRatelimiter(redis: Redis, maxRequests: number, windowMs: number): Ratelimit {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const key = `${maxRequests}:${windowSeconds}`;

  let limiter = limitersMap.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      analytics: false,
    });
    limitersMap.set(key, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): Promise<RateLimitResult> {
  const { maxRequests, windowMs, fallbackPolicy = "fail-closed" } = options;
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const key = `${req.nextUrl.pathname}:${ip}`;

  const redis = getRedisInstance();
  if (!redis) {
    reportError(
      new Error(
        "Upstash Redis credentials missing (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Operating in degraded in-memory rate limiting mode."
      ),
      { key, pathname: req.nextUrl.pathname, ip }
    );
    return checkInMemoryFallback(key, maxRequests, windowMs, fallbackPolicy);
  }

  try {
    const ratelimiter = getRatelimiter(redis, maxRequests, windowMs);
    const res = await ratelimiter.limit(key);

    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      resetMs: Math.max(0, res.reset - Date.now()),
    };
  } catch (error) {
    reportError(error, {
      message: "Upstash Redis rate limit check failed, falling back to local memory rate limiting",
      key,
      pathname: req.nextUrl.pathname,
      ip,
    });
    return checkInMemoryFallback(key, maxRequests, windowMs, fallbackPolicy);
  }
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
    { status: 429 },
  );
}

