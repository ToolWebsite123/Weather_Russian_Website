import { PrismaClient } from "@prisma/client";
import { buildCityRecords } from "../lib/cities-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting city catalog cleanup...");
  const curatedRecords = buildCityRecords();
  const curatedSlugs = Array.from(new Set(curatedRecords.map((c) => c.slug)));

  // 1. Mark all 272 curated Russian cities with isCurated = true
  const updatedCurated = await prisma.city.updateMany({
    where: {
      slug: { in: curatedSlugs },
    },
    data: {
      isCurated: true,
      country: "RU",
    },
  });

  console.log(`Marked ${updatedCurated.count} cities as isCurated = true.`);

  // 2. Delete auto-detected non-curated city entries from database
  const deletedNonCurated = await prisma.city.deleteMany({
    where: {
      slug: { notIn: curatedSlugs },
    },
  });

  console.log(`Deleted ${deletedNonCurated.count} auto-detected non-curated city records.`);

  // 3. Verify total remaining count in database
  const remainingCount = await prisma.city.count();
  const curatedCount = await prisma.city.count({ where: { isCurated: true } });

  console.log(`Cleanup complete! Total cities in DB: ${remainingCount}. Curated cities: ${curatedCount}.`);
}

main()
  .catch((e) => {
    console.error("Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
