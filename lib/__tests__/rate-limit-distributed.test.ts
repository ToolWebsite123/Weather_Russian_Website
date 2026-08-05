import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

// Shared simulated Redis store across invocations
const sharedRedisStore = new Map<string, number>();

vi.mock("@upstash/ratelimit", () => {
  return {
    Ratelimit: class MockRatelimit {
      static slidingWindow(maxRequests: number, window: string) {
        return { maxRequests, window };
      }

      async limit(identifier: string) {
        const current = (sharedRedisStore.get(identifier) ?? 0) + 1;
        sharedRedisStore.set(identifier, current);
        const max = 2;
        const allowed = current <= max;
        return {
          success: allowed,
          limit: max,
          remaining: Math.max(0, max - current),
          reset: Date.now() + 60000,
        };
      }
    },
  };
});

import { checkRateLimit } from "../rate-limit";

describe("Distributed Rate Limiting with Upstash Redis", () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.UPSTASH_REDIS_REST_URL = "https://mock-redis.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "mock-token-123";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    sharedRedisStore.clear();
    vi.restoreAllMocks();
  });

  it("shares rate limiting state across simulated separate function invocations via Redis", async () => {
    const req1 = new NextRequest("http://localhost:3000/api/test");
    const req2 = new NextRequest("http://localhost:3000/api/test");

    // Simulated Instance 1 call
    const res1 = await checkRateLimit(req1, { maxRequests: 2, windowMs: 60000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    // Simulated Instance 2 call (separate invocation, shared Redis state)
    const res2 = await checkRateLimit(req2, { maxRequests: 2, windowMs: 60000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);

    // Simulated Instance 3 call (exceeds max requests limit)
    const res3 = await checkRateLimit(req1, { maxRequests: 2, windowMs: 60000 });
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);
  });

  it("falls back gracefully (allows request) when Redis environment variables are missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const req = new NextRequest("http://localhost:3000/api/test");

    const result = await checkRateLimit(req, { maxRequests: 10, windowMs: 60000 });
    expect(result.success).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Upstash Redis credentials missing")
    );
  });
});
