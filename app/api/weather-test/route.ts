import { NextResponse } from "next/server";
import { getWeatherByCoordinates } from "@/lib/weather";

const MOSCOW_LAT = 55.7558;
const MOSCOW_LON = 37.6173;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await getWeatherByCoordinates(MOSCOW_LAT, MOSCOW_LON);

  if (!result.ok) {
    const status =
      result.status === 401 || result.status === 403
        ? 503
        : result.error.includes("not configured")
          ? 503
          : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
