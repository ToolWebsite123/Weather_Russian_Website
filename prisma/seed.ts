import { PrismaClient } from "@prisma/client";
import { buildCityRecords } from "../lib/cities-data";

const prisma = new PrismaClient();

async function main() {
  const citiesToSeed = buildCityRecords().map((c) => ({
    ...c,
    timezone: null as string | null,
  }));

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
