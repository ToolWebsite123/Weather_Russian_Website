import { describe, it, expect, afterEach, vi } from "vitest";
import { fetchAirQuality } from "../air-quality";

describe("fetchAirQuality", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("handles us_aqi = 0 correctly without throwing an error", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("air-quality-api.open-meteo.com")) {
        return {
          ok: true,
          json: async () => ({
            current: {
              us_aqi: 0,
              pm2_5: 1.2,
              pm10: 3.4,
              ozone: 15.0,
              nitrogen_dioxide: 5.0,
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          daily: { uv_index_max: [2.5] },
        }),
      } as Response;
    });

    const result = await fetchAirQuality(55.75, 37.61);
    expect(result).toBeDefined();
    expect(result.usAqi).toBe(0);
    expect(result.pm25).toBe(1.2);
    expect(result.uvIndex).toBe(2.5);
  });

  it("throws unavailable error when us_aqi is null or undefined", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("air-quality-api.open-meteo.com")) {
        return {
          ok: true,
          json: async () => ({
            current: {
              us_aqi: null,
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({}),
      } as Response;
    });

    await expect(fetchAirQuality(55.75, 37.61)).rejects.toThrow("Air quality data unavailable");
  });

  it("processes normal positive us_aqi values correctly", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes("air-quality-api.open-meteo.com")) {
        return {
          ok: true,
          json: async () => ({
            current: {
              us_aqi: 42,
              pm2_5: 8.5,
              pm10: 14.2,
              ozone: 30.1,
              nitrogen_dioxide: 12.0,
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          daily: { uv_index_max: [4.1] },
        }),
      } as Response;
    });

    const result = await fetchAirQuality(55.75, 37.61);
    expect(result.usAqi).toBe(42);
    expect(result.pm25).toBe(8.5);
    expect(result.uvIndex).toBe(4.1);
  });
});
