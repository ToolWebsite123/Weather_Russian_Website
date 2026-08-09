import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchOpenMeteoMarine, fetchOpenMeteoForecast } from "@/lib/weather/open-meteo";

describe("Real Marine Water Temperature Integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns numeric sea surface temperature for coastal coordinates", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          sea_surface_temperature: 24.6,
        },
      }),
    } as Response);

    const temp = await fetchOpenMeteoMarine(43.6028, 39.7342);
    expect(temp).toBe(24.6);
  });

  it("returns undefined when marine API returns null for inland locations", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        current: {
          sea_surface_temperature: null,
        },
      }),
    } as Response);

    const temp = await fetchOpenMeteoMarine(55.7558, 37.6173);
    expect(temp).toBeUndefined();
  });

  it("includes waterTemperature in forecast bundle when marine data is available", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("marine-api")) {
        return {
          ok: true,
          json: async () => ({ current: { sea_surface_temperature: 21.4 } }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          latitude: 59.9343,
          longitude: 30.3351,
          timezone: "Europe/Moscow",
          current: {
            time: "2026-08-09T10:00",
            temperature_2m: 20,
            apparent_temperature: 19,
            relative_humidity_2m: 65,
            wind_speed_10m: 3,
            wind_direction_10m: 180,
            pressure_msl: 1012,
            weather_code: 1,
            is_day: 1,
            precipitation: 0,
            cloud_cover: 20,
          },
          hourly: {
            time: ["2026-08-09T10:00"],
            temperature_2m: [20],
            precipitation: [0],
            weather_code: [1],
            wind_speed_10m: [3],
            apparent_temperature: [19],
          },
          daily: {
            time: ["2026-08-09"],
            weather_code: [1],
            temperature_2m_max: [22],
            temperature_2m_min: [15],
            precipitation_sum: [0],
            wind_speed_10m_max: [4],
            sunrise: ["2026-08-09T05:00"],
            sunset: ["2026-08-09T21:00"],
          },
        }),
      } as Response;
    });

    const bundle = await fetchOpenMeteoForecast(59.9343, 30.3351);
    expect(bundle.current.waterTemperature).toBe(21.4);
  });
});
