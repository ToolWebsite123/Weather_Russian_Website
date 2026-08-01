import {
  getCachedWeatherForCity,
  getCityBySlug,
  listPopularCities,
  upsertCityFromGeo,
} from "@/lib/weather/cache";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import type { City } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";

export const revalidate = 900;

export async function getFavoritesForSession() {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionId) return [] as { slug: string; name: string }[];
  const rows = await prisma.favorite.findMany({
    where: { sessionId },
    include: { city: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return rows.map((r) => ({ slug: r.city.slug, name: r.city.name }));
}

export async function isCityFavorited(cityId: number): Promise<boolean> {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionId) return false;
  const row = await prisma.favorite.findUnique({
    where: { sessionId_cityId: { sessionId, cityId } },
  });
  return Boolean(row);
}

export async function resolveCity(slug: string): Promise<City | null> {
  const existing = await getCityBySlug(slug);
  if (existing) return existing;

  // Fallback: treat slug tokens as search (e.g. first known seed missing)
  const guess = slug.replace(/-/g, " ");
  const results = await searchPlaces(guess, "ru");
  const match = results.find((r) => r.slug === slug) ?? results[0];
  if (!match) return null;

  return upsertCityFromGeo({
    slug: match.slug === slug ? match.slug : slug,
    name: match.name,
    nameEn: match.nameEn ?? match.name,
    country: match.country || "RU",
    region: match.admin1,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
    population: match.population,
    tier: 2,
  });
}

export async function loadCityWeather(slug: string): Promise<{
  city: City;
  weather: WeatherBundle;
} | null> {
  const city = await resolveCity(slug);
  if (!city) return null;
  const weather = await getCachedWeatherForCity(city);
  return { city, weather };
}

export { listPopularCities };
