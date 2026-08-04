import { NextRequest, NextResponse } from "next/server";

/**
 * Shared in-memory rate limiter using a sliding time window.
 *
 * Note: In-memory rate limiting resets on server restart and is scoped to a single server instance.
 * For multi-instance horizontal scaling, a shared distributed store (such as Redis) should be used.
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const tracker = new Map<string, RateLimitRecord>();

// Periodic cleanup helper to prevent memory leaks in long-running processes
function cleanupStaleRecords(now: number) {
  if (tracker.size > 500) {
    for (const [key, record] of tracker.entries()) {
      if (now > record.resetAt) {
        tracker.delete(key);
      }
    }
  }
}

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

export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions,
): RateLimitResult {
  const { maxRequests, windowMs } = options;
  const ip =
    req.ip ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const key = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();
  cleanupStaleRecords(now);
  const record = tracker.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    tracker.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetMs: Math.max(0, record.resetAt - now),
  };
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Слишком много запросов. Пожалуйста, подождите минуту." },
    { status: 429 },
  );
}
