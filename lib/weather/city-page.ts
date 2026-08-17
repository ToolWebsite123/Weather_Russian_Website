import {
  getCachedWeatherForCity,
  getCityBySlug,
  listPopularCities,
  upsertCityFromGeo,
} from "@/lib/weather/cache";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { findStaticCityBySlug } from "@/lib/weather/static-cities";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";
import type { City } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";
import { formatTemp, latinToCyrillicRu } from "@/lib/cities";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { config } from "@/lib/config";
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
  feisalabad: "faisalabad-pendzhab",
  faisalabad: "faisalabad-pendzhab",
  karachi: "karachi-sind",
  lahore: "lahore-pendzhab",
  islamabad: "islamabad-islamabad",
  rawalpindi: "rawalpindi-pendzhab",
  peshawar: "peshawar-khayber-pakhtunkhva",
  multan: "multan-pendzhab",
  gujranwala: "gujranwala-pendzhab",
  sialkot: "sialkot-pendzhab",
  quetta: "quetta-beludzhistan",
  hyderabad: "hyderabad-sind",
  bahawalpur: "bahawalpur-pendzhab",
  sargodha: "sargodha-pendzhab",
  sukkur: "sukkur-sind",
  abbottabad: "abbottabad-khayber-pakhtunkhva",
  mardan: "mardan-khayber-pakhtunkhva",
  gujrat: "gujrat-pendzhab",
  sahiwal: "sahiwal-pendzhab",
  istanbul: "istanbul-stambul",
  stambul: "istanbul-stambul",
  antalya: "antalya-antalya",
  ankara: "ankara-ankara",
  izmir: "izmir-izmir",
  bodrum: "bodrum-mugla",
  alanya: "alanya-antalya",
  dubai: "dubai-dubai",
  abudhabi: "abu-dhabi-abu-dhabi",
  "abu-dhabi": "abu-dhabi-abu-dhabi",
  sharjah: "sharjah-shardzha",
  almaty: "almaty-almaty",
  astana: "astana-astana",
  shymkent: "shymkent-shymkent",
  karaganda: "karaganda-karagandinskaya-oblast",
  aktobe: "aktobe-aktyubinskaya-oblast",
};

export const resolveCity = cache(async (inputSlug: string): Promise<City | null> => {
  if (!inputSlug) return null;

  // 1. Strip weather- prefix if present and normalize double hyphens
  const rawClean = inputSlug.toLowerCase().replace(/^weather-/, "");
  const cleanSlug = rawClean.replace(/--/g, "-");

  // 2. Extract numeric ID if present (e.g. moscow-4368 -> moscow, 4368 or sialkot-pendzhab--27912744 -> sialkot-pendzhab, 27912744)
  const idMatch = cleanSlug.match(/^(.+?)-(\d+)$/);
  let idNumber: number | undefined;
  let baseSlug = cleanSlug.replace(/-+$/, "");
  if (idMatch) {
    baseSlug = idMatch[1].replace(/-+$/, "");
    idNumber = parseInt(idMatch[2], 10);
  }

  // 3. Try finding by numeric ID first (both positive & negative IDs, in static cities & database)
  if (typeof idNumber === "number" && !isNaN(idNumber)) {
    const staticById =
      findStaticCityBySlug(String(idNumber)) ||
      findStaticCityBySlug(String(-idNumber));
    if (staticById) return staticById;

    try {
      const cityById =
        (await prisma.city.findUnique({ where: { id: idNumber } })) ||
        (await prisma.city.findUnique({ where: { id: -idNumber } }));
      if (cityById) return cityById;
    } catch {
      // database offline or error
    }
  }

  // 4. Try finding by exact slug or alias
  const targetSlug = ALIASES[baseSlug] ?? baseSlug;
  const existing =
    (await getCityBySlug(rawClean)) ||
    (await getCityBySlug(cleanSlug)) ||
    (await getCityBySlug(targetSlug)) ||
    (await getCityBySlug(baseSlug));
  if (existing) return existing;

  const slug = baseSlug;

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

    if (!match) {
      console.warn(`Geocoding search produced no results for slug "${inputSlug}" (guess: "${guess}")`);
      return null;
    }

    const finalSlug = match.slug || targetSlug;

    return upsertCityFromGeo({
      slug: finalSlug,
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
  } catch (err) {
    console.error(`Geocoding resolution error for slug "${inputSlug}":`, err);
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
  } catch (err) {
    console.error(`loadCityWeather error for "${slug}":`, err);
    try {
      const city = await resolveCity(slug);
      if (!city) return null;
      const weather = await getWeatherBundle(
        city.latitude,
        city.longitude,
        14,
        { cache: "no-store" },
        city.slug,
      );
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
