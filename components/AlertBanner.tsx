import type { WeatherAlert } from "@/lib/weather/alerts";

export function AlertBanner({ alerts }: { alerts?: WeatherAlert[] }) {
  void alerts;
  return null;
}
