import type {
  DailyForecast,
  HourlyForecast,
  OpenWeatherData,
  WeatherServiceResult,
} from "@/types/weather";

// Free-tier Current + 5-day/3-hour Forecast (One Call 3.0 needs a paid subscription).
const CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const CACHE_SECONDS = 1800; // 30 minutes
const PLACEHOLDER_KEY = "your_weather_api_key_here";

type OwmWeather = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

type OwmCurrentResponse = {
  coord: { lat: number; lon: number };
  weather: OwmWeather[];
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
  };
  visibility?: number;
  wind: { speed: number; deg?: number };
  clouds: { all: number };
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  dt: number;
  sys: { sunrise?: number; sunset?: number; country?: string };
  timezone: number; // seconds offset from UTC
  name?: string;
};

type OwmForecastItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: OwmWeather[];
  clouds: { all: number };
  wind: { speed: number; deg?: number };
  pop?: number;
  rain?: { "3h"?: number };
  snow?: { "3h"?: number };
  dt_txt?: string;
};

type OwmForecastResponse = {
  list: OwmForecastItem[];
  city?: {
    timezone?: number;
    sunrise?: number;
    sunset?: number;
  };
};

function isConfiguredKey(key: string | undefined): key is string {
  return Boolean(key && key.trim() && key.trim() !== PLACEHOLDER_KEY);
}

function unixToIso(unix: number): string {
  return new Date(unix * 1000).toISOString();
}

function unixToDate(unix: number, offsetSeconds: number): string {
  const localMs = (unix + offsetSeconds) * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function timezoneLabel(offsetSeconds: number): string {
  const hours = offsetSeconds / 3600;
  const sign = hours >= 0 ? "+" : "-";
  const abs = Math.abs(hours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function precipMm(item: {
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
}): number {
  return (
    item.rain?.["3h"] ??
    item.rain?.["1h"] ??
    item.snow?.["3h"] ??
    item.snow?.["1h"] ??
    0
  );
}

async function readOwmError(
  res: Response,
): Promise<WeatherServiceResult> {
  let message = `OpenWeatherMap request failed (${res.status})`;
  try {
    const body = (await res.json()) as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // ignore parse errors on error body
  }
  return { ok: false, error: message, status: res.status };
}

function mapCurrent(
  raw: OwmCurrentResponse,
): OpenWeatherData["current"] {
  const w = raw.weather[0];
  const isDay = w?.icon?.endsWith("d") ?? true;

  return {
    time: unixToIso(raw.dt),
    temperature: raw.main.temp,
    feelsLike: raw.main.feels_like,
    humidity: raw.main.humidity,
    windSpeed: raw.wind.speed,
    windDirection: raw.wind.deg ?? 0,
    pressure: raw.main.pressure,
    weatherCode: w?.id ?? 0,
    isDay,
    precipitation: precipMm(raw),
    cloudCover: raw.clouds.all,
    description: w?.description,
    icon: w?.icon,
  };
}

function mapHourly(list: OwmForecastItem[]): HourlyForecast[] {
  return list.map((h) => {
    const w = h.weather[0];
    return {
      time: unixToIso(h.dt),
      temperature: h.main.temp,
      feelsLike: h.main.feels_like,
      precipitation: precipMm(h) || (h.pop != null ? h.pop : 0),
      weatherCode: w?.id ?? 0,
      windSpeed: h.wind.speed,
      humidity: h.main.humidity,
      description: w?.description ?? "",
      icon: w?.icon ?? "",
    };
  });
}

/** Aggregate 3-hour forecast slots into calendar days (~5 days on free tier). */
function aggregateDaily(
  list: OwmForecastItem[],
  offsetSeconds: number,
  sunrise?: number,
  sunset?: number,
): DailyForecast[] {
  const byDate = new Map<
    string,
    {
      temps: number[];
      precip: number;
      windMax: number;
      humiditySum: number;
      slots: number;
      codes: Map<number, { count: number; description: string; icon: string }>;
    }
  >();

  for (const item of list) {
    const date = unixToDate(item.dt, offsetSeconds);
    let bucket = byDate.get(date);
    if (!bucket) {
      bucket = {
        temps: [],
        precip: 0,
        windMax: 0,
        humiditySum: 0,
        slots: 0,
        codes: new Map(),
      };
      byDate.set(date, bucket);
    }
    bucket.temps.push(item.main.temp_min, item.main.temp_max, item.main.temp);
    bucket.precip += precipMm(item);
    bucket.windMax = Math.max(bucket.windMax, item.wind.speed);
    bucket.humiditySum += item.main.humidity;
    bucket.slots += 1;
    const w = item.weather[0];
    if (w) {
      const prev = bucket.codes.get(w.id) ?? {
        count: 0,
        description: w.description,
        icon: w.icon,
      };
      prev.count += 1;
      bucket.codes.set(w.id, prev);
    }
  }

  const days: DailyForecast[] = [];
  for (const [date, bucket] of Array.from(byDate.entries())) {
    let bestCode = 0;
    let description = "";
    let icon = "";
    let bestCount = 0;
    for (const [code, meta] of Array.from(bucket.codes.entries())) {
      if (meta.count > bestCount) {
        bestCount = meta.count;
        bestCode = code;
        description = meta.description;
        icon = meta.icon;
      }
    }
    days.push({
      date,
      tempMin: Math.min(...bucket.temps),
      tempMax: Math.max(...bucket.temps),
      weatherCode: bestCode,
      precipitationSum: bucket.precip,
      windSpeedMax: bucket.windMax,
      humidity: Math.round(bucket.humiditySum / Math.max(bucket.slots, 1)),
      description,
      icon,
      sunrise: sunrise != null ? unixToIso(sunrise) : undefined,
      sunset: sunset != null ? unixToIso(sunset) : undefined,
    });
  }

  return days.slice(0, 10);
}

function buildUrl(
  base: string,
  lat: number,
  lon: number,
  apiKey: string,
): string {
  const url = new URL(base);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("units", "metric");
  url.searchParams.set("lang", "ru");
  url.searchParams.set("appid", apiKey);
  return url.toString();
}

export async function getWeatherByCoordinates(
  lat: number,
  lon: number,
): Promise<WeatherServiceResult> {
  const apiKey = process.env.WEATHER_API_KEY?.trim();
  if (!isConfiguredKey(apiKey)) {
    return { ok: false, error: "WEATHER_API_KEY is not configured" };
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return { ok: false, error: "Invalid coordinates" };
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(buildUrl(CURRENT_URL, lat, lon, apiKey), {
        next: { revalidate: CACHE_SECONDS },
      }),
      fetch(buildUrl(FORECAST_URL, lat, lon, apiKey), {
        next: { revalidate: CACHE_SECONDS },
      }),
    ]);

    if (!currentRes.ok) {
      return await readOwmError(currentRes);
    }
    if (!forecastRes.ok) {
      return await readOwmError(forecastRes);
    }

    const current = (await currentRes.json()) as OwmCurrentResponse;
    const forecast = (await forecastRes.json()) as OwmForecastResponse;
    const offset = current.timezone ?? forecast.city?.timezone ?? 0;
    const list = forecast.list ?? [];

    const data: OpenWeatherData = {
      latitude: current.coord.lat,
      longitude: current.coord.lon,
      timezone: timezoneLabel(offset),
      current: mapCurrent(current),
      hourly: mapHourly(list),
      daily: aggregateDaily(
        list,
        offset,
        current.sys.sunrise ?? forecast.city?.sunrise,
        current.sys.sunset ?? forecast.city?.sunset,
      ),
      fetchedAt: new Date().toISOString(),
      provider: "openweathermap",
    };

    return { ok: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "OpenWeatherMap request failed";
    return { ok: false, error: message };
  }
}
