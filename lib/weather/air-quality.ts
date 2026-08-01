import type { AirQuality } from "@/types/weather";

type OpenMeteoAQ = {
  current: {
    us_aqi?: number | null;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
    european_aqi?: number | null;
  };
};

function num(value: number | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

type OpenMeteoUV = {
  daily?: { uv_index_max?: number[] };
};

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQuality> {
  const aqUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  aqUrl.searchParams.set("latitude", String(latitude));
  aqUrl.searchParams.set("longitude", String(longitude));
  aqUrl.searchParams.set(
    "current",
    "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,european_aqi",
  );

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", String(latitude));
  forecastUrl.searchParams.set("longitude", String(longitude));
  forecastUrl.searchParams.set("daily", "uv_index_max");
  forecastUrl.searchParams.set("forecast_days", "1");
  forecastUrl.searchParams.set("timezone", "auto");

  const [aqRes, uvRes] = await Promise.all([
    fetch(aqUrl.toString(), { next: { revalidate: 1800 } }),
    fetch(forecastUrl.toString(), { next: { revalidate: 1800 } }),
  ]);

  if (!aqRes.ok) throw new Error("Air quality fetch failed");
  const aq = (await aqRes.json()) as OpenMeteoAQ;
  const usAqi = num(aq.current.us_aqi);
  if (usAqi <= 0) throw new Error("Air quality data unavailable");

  let uvIndex: number | undefined;
  if (uvRes.ok) {
    const uv = (await uvRes.json()) as OpenMeteoUV;
    const raw = uv.daily?.uv_index_max?.[0];
    uvIndex = raw != null && Number.isFinite(Number(raw)) ? Number(raw) : undefined;
  }

  return {
    usAqi,
    pm25: num(aq.current.pm2_5),
    pm10: num(aq.current.pm10),
    ozone: num(aq.current.ozone),
    nitrogenDioxide: num(aq.current.nitrogen_dioxide),
    europeanAqi:
      aq.current.european_aqi != null && Number.isFinite(Number(aq.current.european_aqi))
        ? Number(aq.current.european_aqi)
        : undefined,
    uvIndex,
  };
}
