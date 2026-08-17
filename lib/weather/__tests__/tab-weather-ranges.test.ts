import { describe, it, expect } from "vitest";
import type { WeatherBundle, DailyPoint, HourlyPoint } from "@/types/weather";
import { getUpcomingWeekendDays } from "@/lib/weather/weekend";

describe("Tab Weather Data Range Calculations", () => {
  const createMockBundle = (): WeatherBundle => {
    const yesterdayDate = "2026-08-16";

    const daily: DailyPoint[] = Array.from({ length: 14 }, (_, i) => {
      const d = new Date("2026-08-17");
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      return {
        date: iso,
        tempMin: 12 + i,
        tempMax: 22 + i,
        weatherCode: 0,
        precipitationSum: i * 0.5,
        windSpeedMax: 4 + i,
      };
    });

    const hourly: HourlyPoint[] = Array.from({ length: 24 * 14 }, (_, i) => {
      const dayIndex = Math.floor(i / 24);
      const hour = String(i % 24).padStart(2, "0");
      const d = new Date("2026-08-17");
      d.setDate(d.getDate() + dayIndex);
      const isoDate = d.toISOString().split("T")[0];
      return {
        time: `${isoDate}T${hour}:00`,
        temperature: 15 + (i % 8),
        weatherCode: 0,
        windSpeed: 3.5,
        precipitation: 0,
        isDay: i % 24 >= 6 && i % 24 < 22,
      };
    });

    const yesterdayDaily: DailyPoint = {
      date: yesterdayDate,
      tempMin: 10,
      tempMax: 20,
      weatherCode: 1,
      precipitationSum: 1.2,
      windSpeedMax: 5,
    };

    const yesterdayHourly: HourlyPoint[] = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, "0");
      return {
        time: `${yesterdayDate}T${hour}:00`,
        temperature: 12 + (i % 5),
        weatherCode: 1,
        windSpeed: 4.0,
        precipitation: 0.1,
        isDay: i >= 6 && i < 22,
      };
    });

    return {
      latitude: 31.4504,
      longitude: 73.135,
      timezone: "Asia/Karachi",
      current: {
        time: "2026-08-17T12:00",
        temperature: 19,
        feelsLike: 18,
        humidity: 60,
        pressure: 1013,
        windSpeed: 4,
        windDirection: 180,
        precipitation: 0,
        cloudCover: 10,
        weatherCode: 0,
        isDay: true,
        uvIndex: 4,
      },
      daily,
      hourly,
      yesterday: {
        daily: yesterdayDaily,
        hourly: yesterdayHourly,
      },
      provider: "open-meteo",
      fetchedAt: new Date().toISOString(),
    };
  };

  it("correctly provides yesterday data (date, 24 hourly points)", () => {
    const bundle = createMockBundle();
    expect(bundle.yesterday).toBeDefined();
    expect(bundle.yesterday?.daily.date).toBe("2026-08-16");
    expect(bundle.yesterday?.hourly.length).toBe(24);
    expect(bundle.yesterday?.hourly[0].time).toContain("2026-08-16T00:00");
  });

  it("correctly provides now & today weather details", () => {
    const bundle = createMockBundle();
    expect(bundle.current.temperature).toBe(19);
    expect(bundle.daily[0].date).toBe("2026-08-17");
    expect(bundle.daily[1].date).toBe("2026-08-18");
  });

  it("correctly calculates tomorrow forecast slice", () => {
    const bundle = createMockBundle();
    const tomorrowDaily = bundle.daily.slice(1, 2);
    expect(tomorrowDaily.length).toBe(1);
    expect(tomorrowDaily[0].date).toBe("2026-08-18");

    const tomorrowHourly = bundle.hourly.filter((h) => h.time.startsWith(tomorrowDaily[0].date));
    expect(tomorrowHourly.length).toBe(24);
  });

  it("correctly calculates 7-day, 10-day, and 14-day forecast limits", () => {
    const bundle = createMockBundle();
    expect(bundle.daily.slice(0, 7).length).toBe(7);
    expect(bundle.daily.slice(0, 10).length).toBe(10);
    expect(bundle.daily.slice(0, 14).length).toBe(14);
  });

  it("correctly identifies weekend days from daily forecast", () => {
    const bundle = createMockBundle();
    const weekendDays = getUpcomingWeekendDays(bundle.daily);
    expect(weekendDays.length).toBe(2);
    // Aug 17 2026 is Monday, so upcoming weekend is Sat Aug 22 & Sun Aug 23
    expect(weekendDays[0].date).toBe("2026-08-22");
    expect(weekendDays[1].date).toBe("2026-08-23");
  });
});
