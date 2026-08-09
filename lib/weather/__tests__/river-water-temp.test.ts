import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchOpenMeteoForecast } from "@/lib/weather/open-meteo";

describe("River & Marine Water Temperature Logic", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns source: marine for coastal cities when Marine API returns a numeric SST", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("marine-api")) {
        return {
          ok: true,
          json: async () => ({ current: { sea_surface_temperature: 25.2 } }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          latitude: 43.6028,
          longitude: 39.7342,
          timezone: "Europe/Moscow",
          current: {
            time: "2026-08-09T12:00",
            temperature_2m: 28,
            apparent_temperature: 29,
            relative_humidity_2m: 60,
            wind_speed_10m: 3,
            wind_direction_10m: 180,
            pressure_msl: 1012,
            weather_code: 0,
            is_day: 1,
            precipitation: 0,
            cloud_cover: 0,
          },
          hourly: {
            time: ["2026-08-09T12:00"],
            temperature_2m: [28],
            precipitation: [0],
            weather_code: [0],
            wind_speed_10m: [3],
            apparent_temperature: [29],
          },
          daily: {
            time: ["2026-08-09"],
            weather_code: [0],
            temperature_2m_max: [30],
            temperature_2m_min: [22],
            precipitation_sum: [0],
            wind_speed_10m_max: [4],
            sunrise: ["2026-08-09T05:00"],
            sunset: ["2026-08-09T20:00"],
          },
        }),
      } as Response;
    });

    const bundle = await fetchOpenMeteoForecast(43.6028, 39.7342, 14, undefined, "sochi");
    expect(bundle.current.waterTemperature).toBe(25.2);
    expect(bundle.current.waterTemperatureSource).toBe("marine");
  });

  it("returns source: estimated for curated river cities based on 10-day trailing mean air temp", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("marine-api")) {
        return {
          ok: true,
          json: async () => ({ current: { sea_surface_temperature: null } }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          latitude: 55.7558,
          longitude: 37.6173,
          timezone: "Europe/Moscow",
          current: {
            time: "2026-08-09T12:00",
            temperature_2m: 22,
            apparent_temperature: 22,
            relative_humidity_2m: 55,
            wind_speed_10m: 2,
            wind_direction_10m: 90,
            pressure_msl: 1015,
            weather_code: 1,
            is_day: 1,
            precipitation: 0,
            cloud_cover: 10,
          },
          hourly: {
            time: ["2026-08-09T12:00"],
            temperature_2m: [22],
            precipitation: [0],
            weather_code: [1],
            wind_speed_10m: [2],
            apparent_temperature: [22],
          },
          daily: {
            time: [
              "2026-07-30", "2026-07-31", "2026-08-01", "2026-08-02", "2026-08-03",
              "2026-08-04", "2026-08-05", "2026-08-06", "2026-08-07", "2026-08-08",
              "2026-08-09"
            ],
            weather_code: Array(11).fill(1),
            temperature_2m_max: [24, 25, 26, 25, 24, 23, 24, 25, 26, 24, 22],
            temperature_2m_min: [14, 15, 16, 15, 14, 13, 14, 15, 16, 14, 12],
            precipitation_sum: Array(11).fill(0),
            wind_speed_10m_max: Array(11).fill(3),
            sunrise: Array(11).fill("2026-08-09T05:00"),
            sunset: Array(11).fill("2026-08-09T20:00"),
          },
        }),
      } as Response;
    });

    const bundle = await fetchOpenMeteoForecast(55.7558, 37.6173, 14, undefined, "moscow");
    expect(bundle.current.waterTemperatureSource).toBe("estimated");
    // Trailing 10 days mean = ( (24+14)/2 + (25+15)/2 + (26+16)/2 + ... ) / 10 = 19.7
    expect(bundle.current.waterTemperature).toBe(19.6);
  });

  it("returns waterTemperature: undefined for non-coastal non-river cities", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("marine-api")) {
        return {
          ok: true,
          json: async () => ({ current: { sea_surface_temperature: null } }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          latitude: 50.0,
          longitude: 50.0,
          timezone: "Europe/Moscow",
          current: {
            time: "2026-08-09T12:00",
            temperature_2m: 20,
            apparent_temperature: 20,
            relative_humidity_2m: 50,
            wind_speed_10m: 2,
            wind_direction_10m: 100,
            pressure_msl: 1013,
            weather_code: 0,
            is_day: 1,
            precipitation: 0,
            cloud_cover: 0,
          },
          hourly: {
            time: ["2026-08-09T12:00"],
            temperature_2m: [20],
            precipitation: [0],
            weather_code: [0],
            wind_speed_10m: [2],
            apparent_temperature: [20],
          },
          daily: {
            time: ["2026-08-09"],
            weather_code: [0],
            temperature_2m_max: [22],
            temperature_2m_min: [14],
            precipitation_sum: [0],
            wind_speed_10m_max: [3],
            sunrise: ["2026-08-09T05:00"],
            sunset: ["2026-08-09T20:00"],
          },
        }),
      } as Response;
    });

    const bundle = await fetchOpenMeteoForecast(50.0, 50.0, 14, undefined, "unknown-small-village");
    expect(bundle.current.waterTemperature).toBeUndefined();
    expect(bundle.current.waterTemperatureSource).toBeUndefined();
  });
});
