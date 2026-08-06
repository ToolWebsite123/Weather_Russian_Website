import chunkMajor from "../prisma/data/_chunk_major.json";
import chunkMid1 from "../prisma/data/_chunk_mid1.json";
import { slugifyCity, transliterateRu } from "./cities";

type RawCityTuple = [string, number, number, number, string];

export const EXPLICIT_SLUGS: Record<string, string> = {
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

export type RawCityRecord = {
  slug: string;
  name: string;
  nameEn: string;
  region: string;
  latitude: number;
  longitude: number;
  population: number;
  tier: number;
  country: string;
};

export function buildCityRecords(): RawCityRecord[] {
  const rawList = [...(chunkMajor as RawCityTuple[]), ...(chunkMid1 as RawCityTuple[])];
  const seen = new Set<string>();

  return rawList.map(([name, lat, lon, pop, region]) => {
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
      slug,
      name,
      nameEn: transliterateRu(name),
      region: region ?? name,
      latitude: Number(lat),
      longitude: Number(lon),
      population: Number(pop),
      tier: Number(pop) >= 500000 ? 1 : 2,
      country: "RU",
    };
  });
}
