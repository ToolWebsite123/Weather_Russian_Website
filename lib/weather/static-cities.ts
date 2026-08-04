import chunkMajor from "../../prisma/data/_chunk_major.json";
import chunkMid1 from "../../prisma/data/_chunk_mid1.json";
import { slugifyCity, transliterateRu } from "@/lib/cities";
import type { City } from "@prisma/client";

type RawCityTuple = [string, number, number, number, string];

const EXPLICIT_SLUGS: Record<string, string> = {
  "Москва": "moscow",
  "Санкт-Петербург": "saint-petersburg",
  "Новосибирск": "novosibirsk",
  "Екатеринбург": "yekaterinburg",
  "Казань": "kazan",
  "Нижний Новгород": "nizhny-novgorod",
  "Челябинск": "chelyabinsk",
  "Самара": "samara",
  "Омск": "omsk",
  "Ростов-на-Дону": "rostov-on-don",
  "Уфа": "ufa",
  "Красноярск": "krasnoyarsk",
  "Воронеж": "voronezh",
  "Пермь": "perm",
  "Волгоград": "volgograd",
  "Краснодар": "krasnodar",
  "Саратов": "saratov",
  "Тюмень": "tyumen",
  "Иркутск": "irkutsk",
  "Владивосток": "vladivostok",
};

let STATIC_CITIES_CACHE: City[] | null = null;
let STATIC_CITIES_MAP: Map<string, City> | null = null;

export function getAllStaticCities(): City[] {
  if (STATIC_CITIES_CACHE) return STATIC_CITIES_CACHE;

  const rawList = [...(chunkMajor as RawCityTuple[]), ...(chunkMid1 as RawCityTuple[])];
  const seen = new Set<string>();

  STATIC_CITIES_CACHE = rawList.map(([name, lat, lon, pop, region], index) => {
    let slug = EXPLICIT_SLUGS[name];
    if (!slug) {
      slug = slugifyCity(name);
      if (seen.has(slug)) {
        slug = slugifyCity(name, region);
      }
      let counter = 2;
      while (seen.has(slug)) {
        slug = `${slugifyCity(name)}-${counter++}`;
      }
    }
    seen.add(slug);

    return {
      id: index + 1,
      slug,
      name,
      nameEn: transliterateRu(name),
      region: region ?? name,
      latitude: Number(lat),
      longitude: Number(lon),
      timezone: "Europe/Moscow",
      population: Number(pop),
      tier: Number(pop) >= 500000 ? 1 : 2,
      country: "RU",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

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
