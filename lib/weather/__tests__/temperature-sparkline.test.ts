import { describe, it, expect } from "vitest";
import { getSparklineCoords } from "@/lib/weather/sparkline";
import type { HourlyPoint } from "@/types/weather";

describe("TemperatureSparkline Calculation Logic", () => {
  const mockHourly: HourlyPoint[] = Array.from({ length: 24 }, (_, i) => ({
    time: `2026-08-05T${String(i).padStart(2, "0")}:00:00Z`,
    temperature: 15 + Math.sin(i / 3) * 5,
    precipitation: 0,
    weatherCode: 0,
    windSpeed: 2,
  }));

  it("returns empty result when hourly data is empty or undefined", () => {
    const res = getSparklineCoords([], 100, 28);
    expect(res.coords).toEqual([]);
    expect(res.pathD).toBe("");
    expect(res.isFlat).toBe(true);
  });

  it("calculates 24 valid SVG path coordinates for standard 24h temperature data", () => {
    const res = getSparklineCoords(mockHourly, 100, 28);
    expect(res.coords.length).toBe(24);
    expect(res.pathD).toContain("M");
    expect(res.pathD).toContain("L");
    expect(res.isFlat).toBe(false);
    expect(res.minTemp).toBeLessThan(res.maxTemp);
  });

  it("handles flat temperature trend gracefully without division by zero", () => {
    const flatHourly: HourlyPoint[] = Array.from({ length: 24 }, (_, i) => ({
      time: `2026-08-05T${String(i).padStart(2, "0")}:00:00Z`,
      temperature: 20,
      precipitation: 0,
      weatherCode: 0,
      windSpeed: 2,
    }));

    const res = getSparklineCoords(flatHourly, 100, 28);
    expect(res.coords.length).toBe(24);
    expect(res.isFlat).toBe(true);
    expect(res.minTemp).toBe(20);
    expect(res.maxTemp).toBe(20);
    // All Y coordinates must equal half height (14) for a flat trend
    for (const c of res.coords) {
      expect(c.y).toBe(14);
    }
  });
});
