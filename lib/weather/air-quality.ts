import type { AirQuality, PollenInfo } from "@/types/weather";
import { reportError } from "@/lib/monitoring";

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

function pm25ToUsAqi(pm25: number): number {
  if (pm25 <= 12.0) return Math.round((50 / 12.0) * pm25);
  if (pm25 <= 35.4) return Math.round(50 + ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1));
  if (pm25 <= 55.4) return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
  if (pm25 <= 150.4) return Math.round(151 + ((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5));
  return Math.round(201 + ((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5));
}

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

  const aqRes = await fetch(aqUrl.toString(), { next: { revalidate: 1800 } });

  if (!aqRes.ok) {
    const err = new Error("Air quality fetch failed");
    reportError(err, { latitude, longitude });
    throw err;
  }
  const aq = (await aqRes.json()) as OpenMeteoAQ;
  if (!aq || !aq.current) {
    const err = new Error("Air quality data unavailable");
    reportError(err, { latitude, longitude });
    throw err;
  }

  const rawUsAqi = aq.current.us_aqi != null ? num(aq.current.us_aqi) : null;
  const pm25Val = aq.current.pm2_5 != null ? num(aq.current.pm2_5) : null;
  const pm10Val = aq.current.pm10 != null ? num(aq.current.pm10) : null;

  let usAqi: number | null = rawUsAqi;
  if (usAqi == null && pm25Val != null) {
    usAqi = pm25ToUsAqi(pm25Val);
  } else if (usAqi == null && pm10Val != null) {
    usAqi = Math.round(pm10Val * 0.8);
  } else if (usAqi == null && aq.current.european_aqi != null) {
    usAqi = Math.round(num(aq.current.european_aqi) * 20);
  }

  if (usAqi == null) {
    const err = new Error("Air quality data unavailable");
    reportError(err, { latitude, longitude });
    throw err;
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
    uvIndex: undefined,
    pollen,
  };
}
