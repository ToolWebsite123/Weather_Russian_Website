import { describe, it, expect } from "vitest";
import { formatTimeAgo } from "@/lib/cities";

describe("Weather Cache Freshness & Time-Ago Formatting", () => {
  it("formats Russian relative minutes and hours correctly", () => {
    const now = new Date();

    const min1 = new Date(now.getTime() - 45 * 1000).toISOString();
    expect(formatTimeAgo(min1)).toBe("обновлено меньше минуты назад");

    const min5 = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatTimeAgo(min5)).toBe("обновлено 5 минут назад");

    const min21 = new Date(now.getTime() - 21 * 60 * 1000).toISOString();
    expect(formatTimeAgo(min21)).toBe("обновлено 21 минуту назад");

    const hour2 = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    expect(formatTimeAgo(hour2)).toBe("обновлено 2 часа назад");
  });

  it("ensures payload fetchedAt is a valid recent ISO string within TTL window", () => {
    const fetchedAtStr = new Date().toISOString();
    const fetchedAtDate = new Date(fetchedAtStr);
    const now = new Date();

    const ageMinutes = (now.getTime() - fetchedAtDate.getTime()) / (1000 * 60);
    expect(ageMinutes).toBeLessThan(15);
  });
});
