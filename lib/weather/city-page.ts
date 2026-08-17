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
import { formatTemp, latinToCyrillicRu } from "@/lib/cities";
import { cache as reactCache } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = typeof reactCache === "function" ? reactCache : <T extends (...args: any[]) => any>(fn: T): T => fn;

export const revalidate = 900;

export const getFavoritesForSession = cache(async () => {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) return [] as { slug: string; name: string }[];
    const rows = await prisma.favorite.findMany({
      where: { sessionId },
      include: { city: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return rows.map((r: { city: City }) => ({ slug: r.city.slug, name: r.city.name }));
  } catch {
    return [] as { slug: string; name: string }[];
  }
});

export async function isCityFavorited(cityId: number): Promise<boolean> {
  try {
    const sessionId = cookies().get(SESSION_COOKIE)?.value;
    if (!sessionId) return false;
    const row = await prisma.favorite.findUnique({
      where: { sessionId_cityId: { sessionId, cityId } },
    });
    return Boolean(row);
  } catch {
    return false;
  }
}

const ALIASES: Record<string, string> = {
  spb: "saint-petersburg",
  piter: "saint-petersburg",
  "st-petersburg": "saint-petersburg",
  "sankt-peterburg": "saint-petersburg",
  msk: "moscow",
  moskva: "moscow",
  nhatrang: "nyachang-khanhoa",
  "nha-trang": "nyachang-khanhoa",
  nyachang: "nyachang-khanhoa",
  fukuok: "phu-quoc",
  phuquoc: "phu-quoc",
  pattaya: "pattayya",
  "sharm-el-sheikh": "sharm-esh-sheyh",
  hurgada: "hurghada",
  ekaterinburg: "yekaterinburg",
  "nizhniy-novgorod": "nizhny-novgorod",
  "rostov-na-donu": "rostov-on-don",
};

export const resolveCity = cache(async (slug: string): Promise<City | null> => {
  const targetSlug = ALIASES[slug.toLowerCase()] ?? slug;
  const existing = await getCityBySlug(targetSlug);
  if (existing) return existing;

  // Also check if original slug exists without alias
  if (targetSlug !== slug) {
    const existingRaw = await getCityBySlug(slug);
    if (existingRaw) return existingRaw;
  }

  // Fallback: treat slug tokens as search
  try {
    const guess = slug.replace(/-/g, " ");
    const cyrGuess = latinToCyrillicRu(guess);

    let results = await searchPlaces(guess, "ru");

    if (results.length === 0 && cyrGuess !== guess) {
      results = await searchPlaces(cyrGuess, "ru");
    }

    if (results.length === 0) {
      results = await searchPlaces(guess, "en");
    }

    if (results.length === 0 && slug.includes("-")) {
      const tokens = slug.split("-").filter((t) => t.length >= 2);
      for (const token of tokens) {
        const cyrToken = latinToCyrillicRu(token);
        results = await searchPlaces(token, "ru");
        if (results.length === 0 && cyrToken !== token) {
          results = await searchPlaces(cyrToken, "ru");
        }
        if (results.length === 0) {
          results = await searchPlaces(token, "en");
        }
        if (results.length > 0) break;
      }
    }

    const match =
      results.find((r: { slug: string }) => r.slug === targetSlug || r.slug === slug) ??
      results[0];

    if (!match) return null;

    return upsertCityFromGeo({
      slug: targetSlug,
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
  } catch {
    return null;
  }
});

export const loadCityWeather = cache(async (slug: string): Promise<{
  city: City;
  weather: WeatherBundle;
} | null> => {
  try {
    const city = await resolveCity(slug);
    if (!city) return null;
    const weather = await getCachedWeatherForCity(city);
    return { city, weather };
  } catch {
    // Retry once after brief delay if connection pooler timed out
    try {
      await new Promise((res) => setTimeout(res, 300));
      const city = await resolveCity(slug);
      if (!city) return null;
      const weather = await getCachedWeatherForCity(city);
      return { city, weather };
    } catch {
      return null;
    }
  }
});

export async function getCityCount(): Promise<number> {
  try {
    const count = await prisma.city.count({ where: { isCurated: true, country: "RU" } });
    if (count > 0) return count;
  } catch {
    // fallback
  }
  return 272;
}

export function buildCityOgImageUrl(
  city: { name: string },
  weather?: WeatherBundle | null,
): string {
  const params = new URLSearchParams();
  params.set("city", city.name);
  if (weather?.current) {
    params.set("temp", formatTemp(weather.current.temperature));
    params.set("cond", weatherCodeLabel(weather.current.weatherCode));
  }
  return `${config.siteUrl}/api/og?${params.toString()}`;
}

export { listPopularCities };
