import type { DailyPoint } from "@/types/weather";

/**
 * Calculates the next upcoming Saturday and Sunday from the forecast daily points.
 * Guaranteed to return a complete [Saturday, Sunday] block if present in forecast range.
 */
export function getUpcomingWeekendDays(daily: DailyPoint[]): DailyPoint[] {
  if (!daily || daily.length === 0) return [];

  // Find the index of the first upcoming Saturday (day 6)
  const satIndex = daily.findIndex((d) => {
    const day = new Date(d.date + "T12:00:00").getDay();
    return day === 6;
  });

  if (satIndex !== -1) {
    const sat = daily[satIndex];
    const sun = daily[satIndex + 1];
    return sun ? [sat, sun] : [sat];
  }

  // Fallback if no Saturday in current range: return any weekend days available
  return daily.filter((d) => {
    const day = new Date(d.date + "T12:00:00").getDay();
    return day === 6 || day === 0;
  }).slice(0, 2);
}
