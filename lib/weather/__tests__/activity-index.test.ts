import { describe, it, expect } from "vitest";
import { computeComfortPenalties } from "../activity-index";
import type { CurrentWeather } from "@/types/weather";

describe("computeComfortPenalties", () => {
  const baseWeather: CurrentWeather = {
    temperature: 20,
    feelsLike: 20,
    humidity: 50,
    pressure: 1013,
    windSpeed: 3,
    windDirection: 180,
    weatherCode: 0,
    isDay: true,
    time: "2026-08-03T12:00",
    precipitation: 0,
    cloudCover: 0,
  };

  it("calculates zero penalty for ideal temperature (20°C) and calm wind", () => {
    const result = computeComfortPenalties(baseWeather);
    expect(result.score).toBe(100);
    expect(result.penalties).toHaveLength(0);
  });

  it("applies penalty for cold weather", () => {
    const coldWeather = { ...baseWeather, feelsLike: 10 };
    const result = computeComfortPenalties(coldWeather);
    expect(result.score).toBeLessThan(100);
    expect(result.penalties.some((p) => p.reason.includes("Прохладно"))).toBe(true);
  });

  it("applies penalty for hot weather", () => {
    const hotWeather = { ...baseWeather, feelsLike: 30 };
    const result = computeComfortPenalties(hotWeather);
    expect(result.score).toBeLessThan(100);
    expect(result.penalties.some((p) => p.reason.includes("Жаркая"))).toBe(true);
  });

  it("applies penalty for strong wind", () => {
    const windyWeather = { ...baseWeather, windSpeed: 15 };
    const result = computeComfortPenalties(windyWeather);
    expect(result.score).toBe(85);
    expect(result.penalties.some((p) => p.reason.includes("ветер"))).toBe(true);
  });
});
