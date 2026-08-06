import { describe, it, expect } from "vitest";
import { getSunTimesExtended, getMoonData, isValidDate } from "../astronomy";

describe("Astronomy Calculations & Polar Day/Night Safety", () => {
  it("isValidDate correctly identifies valid dates vs Invalid Date objects", () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date("2026-08-05T12:00:00Z"))).toBe(true);
    expect(isValidDate(new Date(NaN))).toBe(false);
    expect(isValidDate(new Date("invalid"))).toBe(false);
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
  });

  it("calculates valid non-NaN sun times for Moscow", () => {
    const moscowDate = new Date("2026-06-21T12:00:00Z");
    const moscowLat = 55.7558;
    const moscowLon = 37.6173;

    const sun = getSunTimesExtended(moscowDate, moscowLat, moscowLon);

    expect(Number.isNaN(sun.dayLengthMinutes)).toBe(false);
    expect(Number.isNaN(sun.dayLengthDiffMinutes)).toBe(false);
    expect(sun.dayLengthMinutes).toBeGreaterThan(900); // ~17.5 hours
    expect(sun.sunrise).not.toBe("Invalid Date");
    expect(sun.sunset).not.toBe("Invalid Date");
  });

  it("handles Murmansk Polar Day (June 21) without NaN and computes ~1440 min day length", () => {
    const polarDayDate = new Date("2026-06-21T12:00:00Z");
    const murmanskLat = 68.97;
    const murmanskLon = 33.09;

    const sun = getSunTimesExtended(polarDayDate, murmanskLat, murmanskLon);

    expect(Number.isNaN(sun.dayLengthMinutes)).toBe(false);
    expect(Number.isNaN(sun.dayLengthDiffMinutes)).toBe(false);
    expect(sun.dayLengthMinutes).toBe(1440); // 24 hours
    expect(sun.dayLengthDiffMinutes).toBe(0);
  });

  it("handles Murmansk Polar Night (December 21) without NaN and computes 0 min day length", () => {
    const polarNightDate = new Date("2026-12-21T12:00:00Z");
    const murmanskLat = 68.97;
    const murmanskLon = 33.09;

    const sun = getSunTimesExtended(polarNightDate, murmanskLat, murmanskLon);

    expect(Number.isNaN(sun.dayLengthMinutes)).toBe(false);
    expect(Number.isNaN(sun.dayLengthDiffMinutes)).toBe(false);
    expect(sun.dayLengthMinutes).toBe(0); // 0 hours
    expect(sun.dayLengthDiffMinutes).toBe(0);
  });

  it("calculates valid moon data for Murmansk during polar season", () => {
    const polarDate = new Date("2026-06-21T12:00:00Z");
    const moon = getMoonData(polarDate, 68.97, 33.09);

    expect(moon.phaseName).toBeTruthy();
    expect(Number.isNaN(moon.illumination)).toBe(false);
  });
});
