import { NextResponse } from "next/server";
import { getWeatherBundle } from "@/lib/weather";

const MOSCOW_LAT = 55.7558;
const MOSCOW_LON = 37.6173;

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const bundle = await getWeatherBundle(MOSCOW_LAT, MOSCOW_LON);
    return NextResponse.json({ ok: true, data: bundle });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Weather fetch failed";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
