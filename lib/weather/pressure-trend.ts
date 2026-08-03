import type { HourlyPoint } from "@/types/weather";

export type PressureTrendValue = "rising" | "falling" | "stable";

/**
 * Calculates pressure trend based on the change over the last 3 hours of hourly data.
 * Returns "rising" if change > +1 hPa, "falling" if < -1 hPa, otherwise "stable".
 */
export function getPressureTrend(
  hourly: HourlyPoint[],
  currentTime?: string,
): PressureTrendValue {
  if (!hourly || hourly.length === 0) return "stable";

  // Find the target index matching currentTime (up to hour precision) or default to current/first valid hour
  let targetIdx = 0;

  if (currentTime) {
    const currentPrefix = currentTime.slice(0, 13); // e.g. "2026-08-03T11"
    const foundIdx = hourly.findIndex((h) => h.time.startsWith(currentPrefix));
    if (foundIdx !== -1) {
      targetIdx = foundIdx;
    }
  }

  // Look back up to 3 hours
  const pastIdx = Math.max(0, targetIdx - 3);

  const currentPressure = hourly[targetIdx]?.pressure;
  const pastPressure = hourly[pastIdx]?.pressure;

  if (
    typeof currentPressure !== "number" ||
    typeof pastPressure !== "number"
  ) {
    return "stable";
  }

  const diff = currentPressure - pastPressure;

  if (diff > 1) {
    return "rising";
  }
  if (diff < -1) {
    return "falling";
  }
  return "stable";
}
