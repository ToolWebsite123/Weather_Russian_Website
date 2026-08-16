import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/weather/open-meteo";
import { searchQuerySchema } from "@/lib/validations/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
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
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [], error: true }, { status: 502 });
  }
}
