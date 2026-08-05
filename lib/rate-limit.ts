import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
};

const limitersMap = new Map<string, Ratelimit>();

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
  const { maxRequests, windowMs } = options;
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const key = `${req.nextUrl.pathname}:${ip}`;

  const redis = getRedisInstance();
  if (!redis) {
    console.warn(
      "Upstash Redis credentials missing (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Allowing request without distributed rate limiting."
    );
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
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
    console.warn("Upstash Redis rate limit check failed, falling back to allow request:", error);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
    { status: 429 },
  );
}
