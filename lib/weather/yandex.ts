import type { WeatherBundle } from "@/types/weather";

/** Optional Yandex Weather REST informers endpoint (when API key is configured). */
export async function fetchYandexForecast(
  latitude: number,
  longitude: number,
  apiKey: string,
): Promise<WeatherBundle> {
  const url = new URL("https://api.weather.yandex.ru/v2/forecast");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("lang", "ru_RU");
  url.searchParams.set("limit", "14");
  url.searchParams.set("hours", "true");

  const res = await fetch(url.toString(), {
    headers: { "X-Yandex-Weather-Key": apiKey },
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    throw new Error(`Yandex Weather failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    now: number;
    info: { lat: number; lon: number; tzinfo?: { name?: string } };
    fact: {
      temp: number;
      feels_like: number;
      humidity: number;
      wind_speed: number;
      wind_dir: string;
      pressure_mm: number;
      condition: string;
      daytime: string;
      prec_type?: number;
      cloudness?: number;
    };
    forecasts: Array<{
      date: string;
      sunrise?: string;
      sunset?: string;
      parts: {
        day?: { temp_max?: number; temp_min?: number; temp_avg?: number };
        night?: { temp_min?: number };
      };
      hours?: Array<{
        hour: string;
        temp: number;
        feels_like: number;
        prec_mm: number;
        wind_speed: number;
        condition: string;
      }>;
    }>;
  };

  const conditionToCode = (condition: string): number => {
    const map: Record<string, number> = {
      clear: 0,
      "partly-cloudy": 2,
      cloudy: 3,
      overcast: 3,
      drizzle: 51,
      "light-rain": 61,
      rain: 63,
      "heavy-rain": 65,
      showers: 80,
      "light-snow": 71,
      snow: 73,
      "snow-showers": 85,
      thunderstorm: 95,
      "thunderstorm-with-rain": 95,
    };
    return map[condition] ?? 2;
  };

  const windDirToDeg = (dir: string): number => {
    const map: Record<string, number> = {
      n: 0,
      ne: 45,
      e: 90,
      se: 135,
      s: 180,
      sw: 225,
      w: 270,
      nw: 315,
      c: 0,
    };
    return map[dir] ?? 0;
  };

  const hourly = (data.forecasts[0]?.hours ?? []).map((h) => {
    const date = data.forecasts[0].date;
    return {
      time: `${date}T${h.hour.padStart(2, "0")}:00`,
      temperature: h.temp,
      precipitation: h.prec_mm,
      weatherCode: conditionToCode(h.condition),
      windSpeed: h.wind_speed,
      feelsLike: h.feels_like,
    };
  });

  const daily = data.forecasts.map((f) => ({
    date: f.date,
    weatherCode: conditionToCode(data.fact.condition),
    tempMax: f.parts.day?.temp_max ?? f.parts.day?.temp_avg ?? data.fact.temp,
    tempMin:
      f.parts.night?.temp_min ?? f.parts.day?.temp_min ?? data.fact.temp - 3,
    precipitationSum: 0,
    windSpeedMax: data.fact.wind_speed,
    sunrise: f.sunrise,
    sunset: f.sunset,
  }));

  return {
    provider: "yandex",
    latitude: data.info.lat,
    longitude: data.info.lon,
    timezone: data.info.tzinfo?.name ?? "Europe/Moscow",
    current: {
      time: new Date(data.now * 1000).toISOString(),
      temperature: data.fact.temp,
      feelsLike: data.fact.feels_like,
      humidity: data.fact.humidity,
      windSpeed: data.fact.wind_speed,
      windDirection: windDirToDeg(data.fact.wind_dir),
      pressure: data.fact.pressure_mm * 1.333,
      weatherCode: conditionToCode(data.fact.condition),
      isDay: data.fact.daytime === "d",
      precipitation: 0,
      cloudCover: Math.round((data.fact.cloudness ?? 0) * 100),
    },
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
