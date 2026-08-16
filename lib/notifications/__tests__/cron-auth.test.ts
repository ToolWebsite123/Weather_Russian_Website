import { describe, it, expect, beforeAll, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET as sendAlertsGET } from "@/app/api/cron/send-weather-alerts/route";
import { GET as refreshWeatherGET } from "@/app/api/cron/refresh-weather/route";

vi.mock("@/lib/weather/cache", () => ({
  listPopularCities: vi.fn().mockResolvedValue([{ id: 1, slug: "moscow", name: "Москва" }]),
  refreshCityWeatherCache: vi.fn().mockResolvedValue({}),
  getCachedWeatherForCity: vi.fn().mockResolvedValue({ current: {} }),
}));

describe("Cron Security Auth & Route Execution", () => {
  const TEST_SECRET = "super-secret-cron-token-999";

  beforeAll(() => {
    process.env.CRON_SECRET = TEST_SECRET;
  });

  it("returns 401 Unauthorized when Authorization header is missing on send-weather-alerts", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/send-weather-alerts?test=true");
    const res = await sendAlertsGET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized when Authorization header is missing on refresh-weather", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/refresh-weather");
    const res = await refreshWeatherGET(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 Unauthorized when Authorization header is incorrect", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/refresh-weather", {
      headers: {
        authorization: "Bearer invalid-secret-token",
      },
    });
    const res = await refreshWeatherGET(req);
    expect(res.status).toBe(401);
  });

  it("allows execution when valid Bearer CRON_SECRET is provided on refresh-weather", async () => {
    const req = new NextRequest("http://localhost:3000/api/cron/refresh-weather", {
      headers: {
        authorization: `Bearer ${TEST_SECRET}`,
      },
    });
    const res = await refreshWeatherGET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json).toHaveProperty("refreshedCount");
  });
});
