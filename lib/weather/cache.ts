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
  const isRu = countryCode === "RU";

  // If not RU, return transient non-persisted City object to prevent DB pollution
  if (!isRu) {
    return {
      id: getTransientCityId(input.slug),
      slug: input.slug,
      name: input.name,
      nameEn: input.nameEn ?? input.name,
      country: input.country || "UNKNOWN",
      region: input.region ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone ?? "Europe/Moscow",
      population: input.population ?? 100000,
      tier: input.tier ?? 2,
      isCurated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

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
        country: input.country ?? "RU",
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
        country: input.country ?? "RU",
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
      country: input.country || "UNKNOWN",
      region: input.region ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone ?? "Europe/Moscow",
      population: input.population ?? 100000,
      tier: input.tier ?? 2,
      isCurated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getCachedWeatherForCity(
  city: City,
): Promise<WeatherBundle> {
  // Skip DB caching for transient (negative/non-persisted) cities
  if (city.id < 0) {
    return getWeatherBundle(city.latitude, city.longitude, 14);
  }

  const now = new Date();

  try {
    const cached = await prisma.weatherCache.findUnique({
      where: { cityId: city.id },
    });

    if (cached && cached.expiresAt > now) {
      return cached.payload as unknown as WeatherBundle;
    }
  } catch {
    // If DB cache check fails, proceed directly to fetch live weather
  }

  const bundle = await getWeatherBundle(city.latitude, city.longitude, 14);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

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

  return bundle;
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
