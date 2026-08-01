import type { WeatherBundle } from "@/types/weather";
import { fetchOpenMeteoForecast } from "@/lib/weather/open-meteo";

/**
 * Primary: Open-Meteo (free, no key).
 * Optional: Yandex Weather if YANDEX_WEATHER_API_KEY is set (Phase 3+).
 */
export async function getWeatherBundle(
  latitude: number,
  longitude: number,
  forecastDays = 14,
): Promise<WeatherBundle> {
  const yandexKey = process.env.YANDEX_WEATHER_API_KEY;
  if (yandexKey && yandexKey !== "your_yandex_weather_api_key_here") {
    try {
      const { fetchYandexForecast } = await import("@/lib/weather/yandex");
      return await fetchYandexForecast(latitude, longitude, yandexKey);
    } catch {
      // fall through to Open-Meteo
    }
  }

  return fetchOpenMeteoForecast(latitude, longitude, forecastDays);
}

export { getWeatherByCoordinates } from "./openweather";
