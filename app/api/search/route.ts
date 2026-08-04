import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { upsertCityFromGeo } from "@/lib/weather/cache";
import { searchQuerySchema } from "@/lib/validations/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const rateLimit = checkRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
  if (!rateLimit.success) return rateLimitResponse();
  const parseResult = searchQuerySchema.safeParse({
    q: req.nextUrl.searchParams.get("q"),
  });

  if (!parseResult.success) {
    return NextResponse.json({ results: [] });
  }

  const { q } = parseResult.data;

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
