import { describe, it, expect } from "vitest";
import { getPressureTrend } from "../pressure-trend";
import type { HourlyPoint } from "@/types/weather";

describe("getPressureTrend", () => {
  it("returns stable if hourly list is empty or undefined", () => {
    expect(getPressureTrend([])).toBe("stable");
  });

  it("calculates rising pressure trend correctly", () => {
    const hourly: Partial<HourlyPoint>[] = [
      { time: "2026-08-03T10:00", pressure: 1000 },
      { time: "2026-08-03T11:00", pressure: 1001 },
      { time: "2026-08-03T12:00", pressure: 1002 },
      { time: "2026-08-03T13:00", pressure: 1003 },
    ];

    expect(
      getPressureTrend(hourly as HourlyPoint[], "2026-08-03T13:00"),
    ).toBe("rising");
  });

  it("calculates falling pressure trend correctly", () => {
    const hourly: Partial<HourlyPoint>[] = [
      { time: "2026-08-03T10:00", pressure: 1020 },
      { time: "2026-08-03T11:00", pressure: 1018 },
      { time: "2026-08-03T12:00", pressure: 1017 },
      { time: "2026-08-03T13:00", pressure: 1015 },
    ];

    expect(
      getPressureTrend(hourly as HourlyPoint[], "2026-08-03T13:00"),
    ).toBe("falling");
  });

  it("calculates stable pressure when change is within threshold", () => {
    const hourly: Partial<HourlyPoint>[] = [
      { time: "2026-08-03T10:00", pressure: 1013.2 },
      { time: "2026-08-03T11:00", pressure: 1013.4 },
      { time: "2026-08-03T12:00", pressure: 1013.5 },
      { time: "2026-08-03T13:00", pressure: 1013.6 },
    ];

    expect(
      getPressureTrend(hourly as HourlyPoint[], "2026-08-03T13:00"),
    ).toBe("stable");
  });
});
