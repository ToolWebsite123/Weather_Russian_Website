import type { City } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function dist(a: City, b: City) {
  return Math.hypot(a.latitude - b.latitude, a.longitude - b.longitude);
}

export async function getNearbyCities(
  city: City,
  limit = 8,
): Promise<{ slug: string; name: string }[]> {
  const candidates = await prisma.city.findMany({
    where: {
      id: { not: city.id },
      latitude: {
        gte: city.latitude - 4,
        lte: city.latitude + 4,
      },
      longitude: {
        gte: city.longitude - 6,
        lte: city.longitude + 6,
      },
    },
    take: 80,
  });

  return candidates
    .sort((x: City, y: City) => dist(city, x) - dist(city, y))
    .slice(0, limit)
    .map((c: City) => ({ slug: c.slug, name: c.name }));
}
