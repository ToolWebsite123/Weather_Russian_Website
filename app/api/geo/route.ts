import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { upsertCityFromGeo } from "@/lib/weather/cache";
import { slugifyCity } from "@/lib/cities";
import type { City } from "@prisma/client";
import type { GeocodingResult } from "@/types/weather";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "invalid coords" }, { status: 400 });
  }

  try {
    const nearbyName = await nearestCityName(lat, lon);
    const results = await searchPlaces(nearbyName, "ru");
    const match =
      results.sort(
        (a: GeocodingResult, b: GeocodingResult) =>
          dist(lat, lon, a.latitude, a.longitude) -
          dist(lat, lon, b.latitude, b.longitude),
      )[0] ?? null;

    const slug =
      match?.slug ?? slugifyCity(`loc-${lat.toFixed(2)}-${lon.toFixed(2)}`);

    const city = await upsertCityFromGeo({
      slug,
      name: match?.name ?? `Место ${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      nameEn: match?.nameEn ?? match?.name,
      country: match?.country ?? "RU",
      region: match?.admin1,
      latitude: match?.latitude ?? lat,
      longitude: match?.longitude ?? lon,
      timezone: match?.timezone,
      population: match?.population,
      tier: 2,
    });

    return NextResponse.json({ slug: city.slug });
  } catch {
    return NextResponse.json({ error: "geo lookup failed" }, { status: 502 });
  }
}

function dist(lat1: number, lon1: number, lat2: number, lon2: number) {
  return Math.hypot(lat1 - lat2, lon1 - lon2);
}

async function nearestCityName(lat: number, lon: number): Promise<string> {
  const cities = await prisma.city.findMany({ take: 50 });
  if (cities.length === 0) return "Москва";
  const nearest = cities.sort(
    (a: City, b: City) =>
      dist(lat, lon, a.latitude, a.longitude) -
      dist(lat, lon, b.latitude, b.longitude),
  )[0];
  return nearest.name;
}
