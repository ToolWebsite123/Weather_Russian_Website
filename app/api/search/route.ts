import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { upsertCityFromGeo } from "@/lib/weather/cache";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchPlaces(q, "ru");
    // Persist top matches so SEO pages resolve next visit
    await Promise.all(
      results.slice(0, 5).map((r) =>
        upsertCityFromGeo({
          slug: r.slug,
          name: r.name,
          nameEn: r.nameEn ?? r.name,
          country: r.country || "RU",
          region: r.admin1,
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone,
          population: r.population,
          tier: 2,
        }),
      ),
    );
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: true }, { status: 502 });
  }
}
