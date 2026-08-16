import { config } from "@/lib/config";
import { prisma } from "@/lib/prisma";
import { getWeatherBundle } from "@/lib/weather";
import {
  findStaticCityBySlug,
  getStaticPopularCities,
} from "@/lib/weather/static-cities";
import type { WeatherBundle } from "@/types/weather";
import type { City } from "@prisma/client";

const CACHE_TTL_MS = config.cache.ttlMs;

function getTransientCityId(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash) || 1;
  return -pos;
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  try {
    const fromDb = await prisma.city.findUnique({ where: { slug } });
    if (fromDb) return fromDb;
  } catch {
    // Fall back to static dataset if database is unreachable or offline
  }
  return findStaticCityBySlug(slug);
}

export async function upsertCityFromGeo(input: {
  slug: string;
  name: string;
  nameEn?: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  population?: number;
  tier?: number;
}): Promise<City> {
  const countryCode = input.country?.trim().toUpperCase();
  const finalCountry = countryCode && countryCode.length > 0 ? countryCode : "UNKNOWN";

  try {
    const existing = await prisma.city.findUnique({
      where: { slug: input.slug },
      select: { isCurated: true },
    });
    const isCurated = existing?.isCurated ?? false;

    return await prisma.city.upsert({
      where: { slug: input.slug },
      update: {
        name: input.name,
        nameEn: input.nameEn ?? input.name,
        country: finalCountry,
        region: input.region,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        population: input.population,
        tier: input.tier ?? 2,
        isCurated,
      },
      create: {
        slug: input.slug,
        name: input.name,
        nameEn: input.nameEn ?? input.name,
        country: finalCountry,
        region: input.region,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        population: input.population,
        tier: input.tier ?? 2,
        isCurated: false,
      },
    });
  } catch {
    return {
      id: getTransientCityId(input.slug),
      slug: input.slug,
      name: input.name,
      nameEn: input.nameEn ?? input.name,
      country: finalCountry,
      region: input.region ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone ?? "UTC",
      population: input.population ?? null,
      tier: input.tier ?? 2,
      isCurated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function refreshCityWeatherCache(
  city: City,
): Promise<WeatherBundle> {
  const bundle = await getWeatherBundle(
    city.latitude,
    city.longitude,
    14,
    { cache: "no-store" },
    city.slug,
  );
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  if (city.id > 0) {
    try {
      await prisma.weatherCache.upsert({
        where: { cityId: city.id },
        update: {
          payload: bundle as object,
          fetchedAt: now,
          expiresAt,
        },
        create: {
          cityId: city.id,
          payload: bundle as object,
          fetchedAt: now,
          expiresAt,
        },
      });
    } catch {
      // Ignore cache persistence failures on read-only/serverless edge environments
    }
  }

  return bundle;
}

export async function getCachedWeatherForCity(
  city: City,
): Promise<WeatherBundle> {
  // Skip DB caching for transient (negative/non-persisted) cities
  if (city.id < 0) {
    return getWeatherBundle(
      city.latitude,
      city.longitude,
      14,
      { cache: "no-store" },
      city.slug,
    );
  }

  const now = new Date();
  let cachedPayload: WeatherBundle | null = null;

  try {
    const cached = await prisma.weatherCache.findUnique({
      where: { cityId: city.id },
    });

    if (cached) {
      cachedPayload = cached.payload as unknown as WeatherBundle;
      if (cached.expiresAt > now) {
        return cachedPayload;
      }
    }
  } catch {
    // If DB cache check fails, proceed directly to fetch live weather
  }

  try {
    return await refreshCityWeatherCache(city);
  } catch (err) {
    if (cachedPayload) {
      return cachedPayload;
    }
    throw err;
  }
}

export async function listPopularCities(limit = 12): Promise<City[]> {
  try {
    const cities = await prisma.city.findMany({
      where: { isCurated: true },
      orderBy: [{ tier: "asc" }, { population: "desc" }, { name: "asc" }],
      take: limit,
    });
    if (cities.length > 0) return cities;
  } catch {
    // Database query failed, use static fallback
  }
  return getStaticPopularCities(limit);
}

export async function getBatchCachedWeather(
  cities: City[],
): Promise<Record<number, WeatherBundle>> {
  const cityIds = cities.map((c) => c.id).filter((id) => id > 0);
  if (cityIds.length === 0) return {};
  try {
    const now = new Date();
    const rows = await prisma.weatherCache.findMany({
      where: {
        cityId: { in: cityIds },
        expiresAt: { gt: now },
      },
    });
    const map: Record<number, WeatherBundle> = {};
    for (const r of rows) {
      map[r.cityId] = r.payload as unknown as WeatherBundle;
    }
    return map;
  } catch {
    return {};
  }
}
