import { PrismaClient } from "@prisma/client";
import { slugifyCity, transliterateRu } from "../lib/cities";
import chunkMajor from "./data/_chunk_major.json";
import chunkMid1 from "./data/_chunk_mid1.json";

const prisma = new PrismaClient();

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

async function main() {
  const rawList = [...(chunkMajor as RawCityTuple[]), ...(chunkMid1 as RawCityTuple[])];
  const seen = new Set<string>();

  const citiesToSeed = rawList.map(([name, lat, lon, pop, region]) => {
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
      timezone: null as string | null,
      population: Number(pop),
      tier: Number(pop) >= 500000 ? 1 : 2,
      country: "RU",
    };
  });

  for (const city of citiesToSeed) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city,
    });
  }

  console.log(`Successfully seeded ${citiesToSeed.length} cities.`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
