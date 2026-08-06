import { buildCityRecords } from "@/lib/cities-data";
import type { City } from "@prisma/client";

let STATIC_CITIES_CACHE: City[] | null = null;
let STATIC_CITIES_MAP: Map<string, City> | null = null;

export function getAllStaticCities(): City[] {
  if (STATIC_CITIES_CACHE) return STATIC_CITIES_CACHE;

  const records = buildCityRecords();
  const now = new Date();

  STATIC_CITIES_CACHE = records.map((record, index) => ({
    id: index + 1,
    ...record,
    timezone: "Europe/Moscow",
    isCurated: true,
    createdAt: now,
    updatedAt: now,
  }));

  return STATIC_CITIES_CACHE;
}

export function findStaticCityBySlug(slug: string): City | null {
  if (!STATIC_CITIES_MAP) {
    STATIC_CITIES_MAP = new Map();
    for (const city of getAllStaticCities()) {
      STATIC_CITIES_MAP.set(city.slug.toLowerCase(), city);
    }
  }
  return STATIC_CITIES_MAP.get(slug.toLowerCase()) ?? null;
}

export function getStaticPopularCities(limit = 12): City[] {
  const cities = getAllStaticCities();
  return [...cities]
    .sort(
      (a, b) =>
        a.tier - b.tier || (b.population ?? 0) - (a.population ?? 0),
    )
    .slice(0, limit);
}
