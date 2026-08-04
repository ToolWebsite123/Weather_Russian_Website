import type { WeatherBundle } from "@/types/weather";
import { fetchOpenMeteoForecast } from "@/lib/weather/open-meteo";

/**
 * Weather bundle provider (Open-Meteo).
 */
export async function getWeatherBundle(
  latitude: number,
  longitude: number,
  forecastDays = 14,
): Promise<WeatherBundle> {
  return fetchOpenMeteoForecast(latitude, longitude, forecastDays);
}
