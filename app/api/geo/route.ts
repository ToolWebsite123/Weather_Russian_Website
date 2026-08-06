import { NextRequest, NextResponse } from "next/server";
import { geoQuerySchema } from "@/lib/validations/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { resolveCityFromGeo } from "@/lib/weather/geo";
import { LAST_CITY_COOKIE } from "@/components/RememberLastCity";

export async function GET(req: NextRequest) {
  const rateLimit = await checkRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
  if (!rateLimit.success) return rateLimitResponse();

  const parseResult = geoQuerySchema.safeParse({
    lat: req.nextUrl.searchParams.get("lat"),
    lon: req.nextUrl.searchParams.get("lon"),
  });

  if (!parseResult.success) {
    return NextResponse.json({ error: "invalid coords" }, { status: 400 });
  }

  const { lat, lon } = parseResult.data;

  try {
    const city = await resolveCityFromGeo(lat, lon);

    const response = NextResponse.json({ slug: city.slug, name: city.name });
    response.cookies.set(LAST_CITY_COOKIE, city.slug, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    response.cookies.set("last_city", city.slug, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  } catch {
    return NextResponse.json({ error: "geo lookup failed" }, { status: 502 });
  }
}
