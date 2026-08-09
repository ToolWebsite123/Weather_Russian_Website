import { NextRequest, NextResponse } from "next/server";
import { listPopularCities, refreshCityWeatherCache } from "@/lib/weather/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleRefreshWeather(req);
}

export async function POST(req: NextRequest) {
  return handleRefreshWeather(req);
}

async function handleRefreshWeather(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const popularCities = await listPopularCities(50);
    const refreshedSlugs: string[] = [];

    for (const city of popularCities) {
      try {
        await refreshCityWeatherCache(city);
        refreshedSlugs.push(city.slug);
      } catch (err) {
        console.error(`Error refreshing weather cache for ${city.slug}:`, err);
      }
    }

    return NextResponse.json({
      ok: true,
      refreshedCount: refreshedSlugs.length,
      refreshedSlugs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
