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
  try {
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
      },
    });
  } catch {
    return {
      id: Math.floor(Math.random() * 100000) + 1,
      slug: input.slug,
      name: input.name,
      nameEn: input.nameEn ?? input.name,
      country: input.country ?? "RU",
      region: input.region ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone ?? "Europe/Moscow",
      population: input.population ?? 100000,
      tier: input.tier ?? 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function getCachedWeatherForCity(
  city: City,
): Promise<WeatherBundle> {
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
      orderBy: [{ tier: "asc" }, { population: "desc" }, { name: "asc" }],
      take: limit,
    });
    if (cities.length > 0) return cities;
  } catch {
    // Database query failed, use static fallback
  }
  return getStaticPopularCities(limit);
}
