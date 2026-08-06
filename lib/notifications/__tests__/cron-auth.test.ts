import { describe, it, expect, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/cron/send-weather-alerts/route";

describe("Cron Send Weather Alerts Security Auth", () => {
  const TEST_SECRET = "super-secret-cron-token-999";

  beforeAll(() => {
    process.env.CRON_SECRET = TEST_SECRET;
  });

  it("returns 401 Unauthorized when Authorization header is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/send-weather-alerts?test=true");
    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 Unauthorized when Authorization header is incorrect", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/send-weather-alerts?test=true", {
      headers: {
        authorization: "Bearer invalid-secret-token",
      },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("allows execution when valid Bearer CRON_SECRET is provided", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/send-weather-alerts?test=true", {
      headers: {
        authorization: `Bearer ${TEST_SECRET}`,
      },
    });
    const res = await GET(req);
    // Should pass authorization check and proceed to handler logic (200 OK)
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});
