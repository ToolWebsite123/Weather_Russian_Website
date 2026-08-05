/**
 * Central application configuration.
 * Environment variables override default values where appropriate.
 */

export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://weatherhub.ru",
  cache: {
    ttlMs: process.env.WEATHER_CACHE_TTL_MINUTES
      ? parseInt(process.env.WEATHER_CACHE_TTL_MINUTES, 10) * 60 * 1000
      : 15 * 60 * 1000, // 15 minutes default
  },
  weather: {
    comfortTempMin: process.env.COMFORT_TEMP_MIN
      ? parseFloat(process.env.COMFORT_TEMP_MIN)
      : 18,
    comfortTempMax: process.env.COMFORT_TEMP_MAX
      ? parseFloat(process.env.COMFORT_TEMP_MAX)
      : 24,
    defaultPopularCitiesLimit: 12,
    forecastDays: 14,
  },
  api: {
    searchMaxResults: 10,
  },
} as const;
