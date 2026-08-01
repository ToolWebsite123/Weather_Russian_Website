export type WeatherProvider = "open-meteo" | "yandex" | "weatherapi";

export type GeocodingResult = {
  id: string;
  name: string;
  nameEn?: string;
  nameRu?: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
  slug: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
};

export type HourlyPoint = {
  time: string;
  temperature: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  feelsLike?: number;
};

export type DailyPoint = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  windSpeedMax: number;
  sunrise?: string;
  sunset?: string;
};

export type WeatherBundle = {
  provider: WeatherProvider;
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  fetchedAt: string;
};

export type AirQuality = {
  usAqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
  nitrogenDioxide: number;
  europeanAqi?: number;
  uvIndex?: number;
};

/** OpenWeatherMap One Call — hourly forecast point */
export type HourlyForecast = {
  time: string;
  temperature: number;
  feelsLike: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  description: string;
  icon: string;
};

/** OpenWeatherMap One Call — daily forecast point */
export type DailyForecast = {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  precipitationSum: number;
  windSpeedMax: number;
  humidity: number;
  description: string;
  icon: string;
  sunrise?: string;
  sunset?: string;
};

export type OpenWeatherData = {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather & { description?: string; icon?: string };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  fetchedAt: string;
  provider: "openweathermap";
};

export type WeatherServiceError = {
  ok: false;
  error: string;
  status?: number;
};

export type WeatherServiceResult =
  | { ok: true; data: OpenWeatherData }
  | WeatherServiceError;
