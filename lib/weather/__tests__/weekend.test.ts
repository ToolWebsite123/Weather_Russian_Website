import { describe, it, expect } from "vitest";
import { getUpcomingWeekendDays } from "@/lib/weather/weekend";
import type { DailyPoint } from "@/types/weather";

describe("getUpcomingWeekendDays calculation logic", () => {
  const createDailyPoint = (dateStr: string): DailyPoint => ({
    date: dateStr,
    tempMin: 15,
    tempMax: 22,
    weatherCode: 0,
    precipitationSum: 0,
    windSpeedMax: 5,
  });

  it("returns empty array for empty input", () => {
    expect(getUpcomingWeekendDays([])).toEqual([]);
  });

  it("correctly identifies upcoming Saturday and Sunday when today is Wednesday", () => {
    // Wed 2026-08-05 through Tue 2026-08-11
    const daily: DailyPoint[] = [
      createDailyPoint("2026-08-05"), // Wed
      createDailyPoint("2026-08-06"), // Thu
      createDailyPoint("2026-08-07"), // Fri
      createDailyPoint("2026-08-08"), // Sat
      createDailyPoint("2026-08-09"), // Sun
      createDailyPoint("2026-08-10"), // Mon
      createDailyPoint("2026-08-11"), // Tue
    ];

    const result = getUpcomingWeekendDays(daily);
    expect(result.length).toBe(2);
    expect(result[0].date).toBe("2026-08-08"); // Saturday
    expect(result[1].date).toBe("2026-08-09"); // Sunday
  });

  it("correctly includes today and tomorrow when today is Saturday", () => {
    // Sat 2026-08-08 through Fri 2026-08-14
    const daily: DailyPoint[] = [
      createDailyPoint("2026-08-08"), // Sat
      createDailyPoint("2026-08-09"), // Sun
      createDailyPoint("2026-08-10"), // Mon
      createDailyPoint("2026-08-11"), // Tue
      createDailyPoint("2026-08-12"), // Wed
      createDailyPoint("2026-08-13"), // Thu
      createDailyPoint("2026-08-14"), // Fri
    ];

    const result = getUpcomingWeekendDays(daily);
    expect(result.length).toBe(2);
    expect(result[0].date).toBe("2026-08-08"); // Saturday
    expect(result[1].date).toBe("2026-08-09"); // Sunday
  });
});
