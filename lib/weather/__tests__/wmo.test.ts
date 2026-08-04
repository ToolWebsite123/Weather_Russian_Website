import { describe, it, expect } from "vitest";
import { weatherCodeLabel, weatherCodeEmoji } from "../wmo";

describe("WMO Code Helpers", () => {
  it("returns correct Russian label for known WMO codes", () => {
    expect(weatherCodeLabel(0)).toBe("Ясно");
    expect(weatherCodeLabel(63)).toBe("Дождь");
    expect(weatherCodeLabel(95)).toBe("Гроза");
  });

  it("returns default fallback label for unknown WMO codes", () => {
    expect(weatherCodeLabel(999)).toBe("Переменная погода");
  });

  it("returns correct emoji based on daytime status", () => {
    expect(weatherCodeEmoji(0, true)).toBe("☀️");
    expect(weatherCodeEmoji(0, false)).toBe("🌙");
    expect(weatherCodeEmoji(63, true)).toBe("🌧");
    expect(weatherCodeEmoji(95, true)).toBe("⛈");
  });
});
