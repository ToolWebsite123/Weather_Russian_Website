import type { HourlyPoint } from "@/types/weather";

export type DayPartKey = "morning" | "day" | "evening" | "night";

export type DayPartSummary = {
  key: DayPartKey;
  label: string;
  temperature: number;
  weatherCode: number;
  precipitation: number;
  windSpeed: number;
};

const PARTS: { key: DayPartKey; label: string; hours: number[] }[] = [
  { key: "morning", label: "Утро", hours: [6, 7, 8, 9, 10, 11] },
  { key: "day", label: "День", hours: [12, 13, 14, 15, 16, 17] },
  { key: "evening", label: "Вечер", hours: [18, 19, 20, 21] },
  { key: "night", label: "Ночь", hours: [0, 1, 2, 3, 4, 5, 22, 23] },
];

export function summarizeDayParts(
  hourly: HourlyPoint[],
  date: string,
): DayPartSummary[] {
  const dayHours = hourly.filter((h) => h.time.startsWith(date));

  return PARTS.map((part) => {
    const points = dayHours.filter((h) => {
      const hour = new Date(h.time).getHours();
      return part.hours.includes(hour);
    });
    if (points.length === 0) {
      return {
        key: part.key,
        label: part.label,
        temperature: NaN,
        weatherCode: 2,
        precipitation: 0,
        windSpeed: 0,
      };
    }
    const temperature =
      points.reduce((s, p) => s + p.temperature, 0) / points.length;
    const precipitation = points.reduce((s, p) => s + p.precipitation, 0);
    const windSpeed =
      points.reduce((s, p) => s + p.windSpeed, 0) / points.length;
    const mid = points[Math.floor(points.length / 2)];
    return {
      key: part.key,
      label: part.label,
      temperature,
      weatherCode: mid.weatherCode,
      precipitation,
      windSpeed,
    };
  }).filter((p) => !Number.isNaN(p.temperature));
}
