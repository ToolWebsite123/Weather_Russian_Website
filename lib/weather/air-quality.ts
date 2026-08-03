import type { AirQuality, PollenInfo } from "@/types/weather";

type OpenMeteoAQ = {
  current: {
    us_aqi?: number | null;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
    sulphur_dioxide?: number | null;
    carbon_monoxide?: number | null;
    european_aqi?: number | null;
    alder_pollen?: number | null;
    birch_pollen?: number | null;
    grass_pollen?: number | null;
    ragweed_pollen?: number | null;
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
    [
      "us_aqi",
      "pm2_5",
      "pm10",
      "ozone",
      "nitrogen_dioxide",
      "sulphur_dioxide",
      "carbon_monoxide",
      "european_aqi",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "ragweed_pollen",
    ].join(","),
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

  const hasPollen =
    aq.current.alder_pollen != null ||
    aq.current.birch_pollen != null ||
    aq.current.grass_pollen != null ||
    aq.current.ragweed_pollen != null;

  const pollen: PollenInfo | undefined = hasPollen
    ? {
        alder:
          aq.current.alder_pollen != null
            ? num(aq.current.alder_pollen)
            : undefined,
        birch:
          aq.current.birch_pollen != null
            ? num(aq.current.birch_pollen)
            : undefined,
        grass:
          aq.current.grass_pollen != null
            ? num(aq.current.grass_pollen)
            : undefined,
        ragweed:
          aq.current.ragweed_pollen != null
            ? num(aq.current.ragweed_pollen)
            : undefined,
      }
    : undefined;

  return {
    usAqi,
    pm25: num(aq.current.pm2_5),
    pm10: num(aq.current.pm10),
    ozone: num(aq.current.ozone),
    nitrogenDioxide: num(aq.current.nitrogen_dioxide),
    sulphurDioxide:
      aq.current.sulphur_dioxide != null
        ? num(aq.current.sulphur_dioxide)
        : undefined,
    carbonMonoxide:
      aq.current.carbon_monoxide != null
        ? num(aq.current.carbon_monoxide)
        : undefined,
    europeanAqi:
      aq.current.european_aqi != null && Number.isFinite(Number(aq.current.european_aqi))
        ? Number(aq.current.european_aqi)
        : undefined,
    uvIndex,
    pollen,
  };
}
