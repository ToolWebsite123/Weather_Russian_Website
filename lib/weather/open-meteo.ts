import type {
  DailyPoint,
  GeocodingResult,
  HourlyPoint,
  WeatherBundle,
} from "@/types/weather";
import { slugifyCity } from "@/lib/cities";
import { reportError } from "@/lib/monitoring";
import { isRiverCity } from "@/lib/weather/river-cities";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

type OpenMeteoForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset_seconds?: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index?: number;
    dew_point_2m?: number;
    visibility?: number;
    wind_gusts_10m?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    apparent_temperature: number[];
    precipitation_probability?: number[];
    dew_point_2m?: number[];
    wind_gusts_10m?: number[];
    pressure_msl?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max?: number[];
  };
};

type OpenMeteoGeo = {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country_code?: string;
    admin1?: string;
    timezone?: string;
    population?: number;
  }>;
};

export async function searchPlaces(
  query: string,
  language = "ru",
): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const url = new URL(GEOCODE_URL);
  url.searchParams.set("name", q);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", language);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error("Geocoding failed");

  const data = (await res.json()) as OpenMeteoGeo;
  return (data.results ?? [])
    .filter((r) => !r.country_code || r.country_code.toUpperCase() === "RU")
    .map((r) => ({
      id: String(r.id),
      name: r.name,
      nameEn: r.name,
      nameRu: r.name,
      country: (r.country_code ?? "RU").toUpperCase(),
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      population: r.population,
      slug: slugifyCity(r.name, r.admin1),
    }));
}

export async function fetchOpenMeteoMarine(
  latitude: number,
  longitude: number,
  options?: RequestInit,
): Promise<number | undefined> {
  try {
    const url = new URL(MARINE_URL);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "sea_surface_temperature");

    const fetchOptions = options ?? { cache: "no-store" };
    const res = await fetch(url.toString(), fetchOptions);
    if (!res.ok) return undefined;

    const data = await res.json();
    const sst = data?.current?.sea_surface_temperature;
    if (typeof sst === "number" && !isNaN(sst)) {
      return Math.round(sst * 10) / 10;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function fetchOpenMeteoForecast(
  latitude: number,
  longitude: number,
  forecastDays = 14,
  options?: RequestInit,
  citySlug?: string,
): Promise<WeatherBundle> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("past_days", "10");
  url.searchParams.set("forecast_days", String(Math.min(16, forecastDays)));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "dew_point_2m",
      "visibility",
      "wind_gusts_10m",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "apparent_temperature",
      "precipitation_probability",
      "dew_point_2m",
      "wind_gusts_10m",
      "pressure_msl",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
      "sunrise",
      "sunset",
      "uv_index_max",
    ].join(","),
  );
  url.searchParams.set("wind_speed_unit", "ms");

  const fetchOptions = options ?? { cache: "no-store" };

  const [res, marineWaterTemp] = await Promise.all([
    fetch(url.toString(), fetchOptions),
    fetchOpenMeteoMarine(latitude, longitude, fetchOptions).catch(() => undefined),
  ]);

  if (!res.ok) {
    const err = new Error(`Forecast fetch failed with status ${res.status}`);
    reportError(err, { latitude, longitude });
    throw err;
  }

  const data = (await res.json()) as OpenMeteoForecast;
  const offsetSec = data.utc_offset_seconds ?? 0;

  const allHourly: HourlyPoint[] = data.hourly.time.map((time, i) => ({
    time,
    temperature: data.hourly.temperature_2m[i],
    precipitation: data.hourly.precipitation[i],
    weatherCode: data.hourly.weather_code[i],
    windSpeed: data.hourly.wind_speed_10m[i],
    feelsLike: data.hourly.apparent_temperature[i],
    precipitationProbability: data.hourly.precipitation_probability?.[i],
    dewPoint: data.hourly.dew_point_2m?.[i],
    windGusts: data.hourly.wind_gusts_10m?.[i],
    pressure: data.hourly.pressure_msl?.[i],
  }));

  const allDaily: DailyPoint[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    sunrise: formatIsoWithOffset(data.daily.sunrise[i], offsetSec) ?? data.daily.sunrise[i],
    sunset: formatIsoWithOffset(data.daily.sunset[i], offsetSec) ?? data.daily.sunset[i],
    uvIndexMax: data.daily.uv_index_max?.[i],
  }));

  const currentDateIso = data.current.time.split("T")[0];
  const pastDailyPoints = allDaily.filter((d) => d.date < currentDateIso);

  const yesterdayDaily = pastDailyPoints.length > 0 ? pastDailyPoints[pastDailyPoints.length - 1] : undefined;
  const daily = allDaily.filter((d) => d.date >= currentDateIso);

  const yesterdayHourly = yesterdayDaily
    ? allHourly.filter((h) => h.time.startsWith(yesterdayDaily.date))
    : [];
  const hourly = yesterdayDaily
    ? allHourly.filter((h) => !h.time.startsWith(yesterdayDaily.date) && h.time >= currentDateIso)
    : allHourly.filter((h) => h.time >= currentDateIso);

  const trailing10 = pastDailyPoints.slice(-10);
  let riverEstimatedWaterTemp: number | undefined;
  if (trailing10.length > 0) {
    const sum = trailing10.reduce((acc, d) => acc + (d.tempMax + d.tempMin) / 2, 0);
    riverEstimatedWaterTemp = Math.round((sum / trailing10.length) * 10) / 10;
  }

  let finalWaterTemp: number | undefined;
  let finalWaterSource: "marine" | "estimated" | undefined;

  if (typeof marineWaterTemp === "number" && !isNaN(marineWaterTemp)) {
    finalWaterTemp = marineWaterTemp;
    finalWaterSource = "marine";
  } else if (citySlug && isRiverCity(citySlug) && typeof riverEstimatedWaterTemp === "number") {
    finalWaterTemp = riverEstimatedWaterTemp;
    finalWaterSource = "estimated";
  }

  return {
    provider: "open-meteo",
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.pressure_msl,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1,
      precipitation: data.current.precipitation,
      cloudCover: data.current.cloud_cover,
      uvIndex: data.current.uv_index,
      dewPoint: data.current.dew_point_2m,
      visibility: data.current.visibility,
      windGusts: data.current.wind_gusts_10m,
      waterTemperature: finalWaterTemp,
      waterTemperatureSource: finalWaterSource,
    },
    hourly,
    daily,
    yesterday: yesterdayDaily ? { daily: yesterdayDaily, hourly: yesterdayHourly } : undefined,
    fetchedAt: new Date().toISOString(),
  };
}

function formatIsoWithOffset(
  timeStr: string | undefined,
  offsetSeconds: number = 0,
): string | undefined {
  if (!timeStr) return undefined;
  if (
    timeStr.endsWith("Z") ||
    timeStr.includes("+") ||
    (timeStr.includes("-") && timeStr.length > 16 && timeStr.indexOf("-", 10) > 0)
  ) {
    return timeStr;
  }
  const sign = offsetSeconds >= 0 ? "+" : "-";
  const absSec = Math.abs(offsetSeconds);
  const hours = String(Math.floor(absSec / 3600)).padStart(2, "0");
  const mins = String(Math.floor((absSec % 3600) / 60)).padStart(2, "0");
  const sec = timeStr.length === 16 ? ":00" : "";
  return `${timeStr}${sec}${sign}${hours}:${mins}`;
}
