import { prisma } from "@/lib/prisma";
import { getWeatherBundle } from "@/lib/weather";
import type { WeatherBundle } from "@/types/weather";
import type { City } from "@prisma/client";

const CACHE_TTL_MS = 15 * 60 * 1000;

export async function getCityBySlug(slug: string): Promise<City | null> {
  return prisma.city.findUnique({ where: { slug } });
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
  return prisma.city.upsert({
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
}

export async function getCachedWeatherForCity(
  city: City,
): Promise<WeatherBundle> {
  const now = new Date();
  const cached = await prisma.weatherCache.findUnique({
    where: { cityId: city.id },
  });

  if (cached && cached.expiresAt > now) {
    console.log(`[WEATHER CACHE HIT] City: ${city.name} (${city.slug}), ID: ${city.id}`);
    return cached.payload as unknown as WeatherBundle;
  }

  console.log(`[WEATHER CACHE MISS] Fetching fresh weather for City: ${city.name} (${city.slug}), ID: ${city.id}`);
  const bundle = await getWeatherBundle(city.latitude, city.longitude, 14);
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);

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

  return bundle;
}

export async function listPopularCities(limit = 12): Promise<City[]> {
  return prisma.city.findMany({
    orderBy: [{ tier: "asc" }, { population: "desc" }, { name: "asc" }],
    take: limit,
  });
}
