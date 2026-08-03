import type {
  DailyPoint,
  GeocodingResult,
  HourlyPoint,
  WeatherBundle,
} from "@/types/weather";
import { slugifyCity } from "@/lib/cities";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

type OpenMeteoForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
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
  return (data.results ?? []).map((r) => ({
    id: String(r.id),
    name: r.name,
    nameEn: r.name,
    nameRu: r.name,
    country: r.country_code ?? "",
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
    population: r.population,
    slug: slugifyCity(r.name, r.admin1),
  }));
}

export async function fetchOpenMeteoForecast(
  latitude: number,
  longitude: number,
  forecastDays = 14,
): Promise<WeatherBundle> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", "auto");
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

  const res = await fetch(url.toString(), {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error("Forecast fetch failed");

  const data = (await res.json()) as OpenMeteoForecast;
  const hourly: HourlyPoint[] = data.hourly.time.map((time, i) => ({
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

  const daily: DailyPoint[] = data.daily.time.map((date, i) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
    sunrise: data.daily.sunrise[i],
    sunset: data.daily.sunset[i],
    uvIndexMax: data.daily.uv_index_max?.[i],
  }));

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
    },
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
