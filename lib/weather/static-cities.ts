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
    const all = getAllStaticCities();
    for (const city of all) {
      const fullSlug = city.slug.toLowerCase();
      STATIC_CITIES_MAP.set(fullSlug, city);
      const namePortion = fullSlug.split("-")[0];
      if (namePortion && !STATIC_CITIES_MAP.has(namePortion)) {
        STATIC_CITIES_MAP.set(namePortion, city);
      }
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

  // 3. Prefix match (check full slug and city-name-only portion)
  const all = getAllStaticCities();
  for (const city of all) {
    const cSlug = city.slug.toLowerCase();
    const namePortion = cSlug.split("-")[0];
    if (clean.startsWith(`${cSlug}-`) || (namePortion && clean.startsWith(`${namePortion}-`))) {
      return city;
    }
  }

  // 4. Token match (looks up tokens in STATIC_CITIES_MAP which includes full slugs & name portions)
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
