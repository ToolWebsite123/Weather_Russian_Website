import { NextRequest, NextResponse } from "next/server";
import { listPopularCities, refreshCityWeatherCache } from "@/lib/weather/cache";

export const dynamic = "force-dynamic";
// Note: maxDuration extends Vercel Serverless Function execution limit to 60s (requires Vercel Pro plan)
export const maxDuration = 60;

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
    const failedSlugs: string[] = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < popularCities.length; i += BATCH_SIZE) {
      const batch = popularCities.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((city) => refreshCityWeatherCache(city))
      );

      results.forEach((res, idx) => {
        const city = batch[idx];
        if (res.status === "fulfilled") {
          refreshedSlugs.push(city.slug);
        } else {
          console.error(`Error refreshing weather cache for ${city.slug}:`, res.reason);
          failedSlugs.push(city.slug);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      refreshedCount: refreshedSlugs.length,
      failedCount: failedSlugs.length,
      refreshedSlugs,
      failedSlugs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

