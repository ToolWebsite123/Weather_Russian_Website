import { buildCityRecords } from "@/lib/cities-data";
import { getCityTimezone } from "@/lib/cities";
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
    timezone: getCityTimezone(record.name, record.region, record.longitude),
    isCurated: true,
    createdAt: now,
    updatedAt: now,
  }));

  return STATIC_CITIES_CACHE;
}

export function findStaticCityBySlug(slug: string): City | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();

  if (!STATIC_CITIES_MAP) {
    STATIC_CITIES_MAP = new Map();
    for (const city of getAllStaticCities()) {
      STATIC_CITIES_MAP.set(city.slug.toLowerCase(), city);
    }
  }

  // 1. Direct exact match
  const exact = STATIC_CITIES_MAP.get(clean);
  if (exact) return exact;

  // 2. Check if slug is numeric ID
  const numId = parseInt(clean, 10);
  if (!isNaN(numId) && String(numId) === clean) {
    const all = getAllStaticCities();
    const matchById = all.find((c) => c.id === numId);
    if (matchById) return matchById;
  }

  // 3. Prefix match (e.g. "faisalabad-saddar-tehsil" -> matches "faisalabad")
  const all = getAllStaticCities();
  for (const city of all) {
    const cSlug = city.slug.toLowerCase();
    if (clean.startsWith(`${cSlug}-`)) {
      return city;
    }
  }

  // 4. Token match (e.g. "faisalabad-district")
  const tokens = clean.split("-").filter((t) => t.length >= 3);
  for (const token of tokens) {
    const tokenMatch = STATIC_CITIES_MAP.get(token);
    if (tokenMatch) return tokenMatch;
  }

  return null;
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
