/**
 * WeatherHub Automated Accuracy Audit Pipeline — Step 1: Snapshot Fetcher
 *
 * HOW TO RE-RUN THE AUDIT:
 * ------------------------
 * 1. Run this script to fetch fresh live data from WeatherHub and save to JSON:
 *    npx tsx scripts/audit-snapshot.ts
 *
 * 2. Ensure live competitor benchmark data in scripts/audit-competitors.json is up to date.
 *
 * 3. Programmatically generate the markdown audit report:
 *    npx tsx scripts/generate-audit-report.ts
 */

import fs from "fs";
import path from "path";
import { loadCityWeather } from "@/lib/weather/city-page";
import { weatherCodeLabel } from "@/lib/weather/wmo";

const cities = ["moscow", "saint-petersburg", "sochi", "novosibirsk", "murmansk"];

export type AuditCitySnapshot = {
  name: string;
  slug: string;
  coords: { lat: number; lon: number };
  timezone: string;
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  pressureHpa: number;
  pressureMmHg: number;
  weatherCode: number;
  conditionLabel: string;
  sunriseLocal: string;
  sunsetLocal: string;
  sunriseIso: string;
  sunsetIso: string;
};

export type AuditSnapshotResult = {
  timestamp: string;
  cities: AuditCitySnapshot[];
};

async function main() {
  const timestamp = new Date().toISOString();
  console.log("=========================================");
  console.log("Fetching WeatherHub Snapshot at:", timestamp);
  console.log("=========================================");

  const snapshots: AuditCitySnapshot[] = [];

  for (const slug of cities) {
    const data = await loadCityWeather(slug);
    if (!data) {
      console.error(`[FAIL] City not found: ${slug}`);
      continue;
    }
    const { city, weather } = data;
    const cur = weather.current;
    const today = weather.daily[0];

    const tz = weather.timezone || city.timezone || "Europe/Moscow";

    const sunriseLocal = today.sunrise
      ? new Date(today.sunrise).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: tz,
        })
      : "N/A";

    const sunsetLocal = today.sunset
      ? new Date(today.sunset).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: tz,
        })
      : "N/A";

    const snapshot: AuditCitySnapshot = {
      name: city.name,
      slug: city.slug,
      coords: { lat: city.latitude, lon: city.longitude },
      timezone: tz,
      temperature: cur.temperature,
      feelsLike: cur.feelsLike,
      windSpeed: cur.windSpeed,
      windDirection: cur.windDirection,
      humidity: cur.humidity,
      pressureHpa: cur.pressure,
      pressureMmHg: Math.round(cur.pressure * 0.750062),
      weatherCode: cur.weatherCode,
      conditionLabel: weatherCodeLabel(cur.weatherCode),
      sunriseLocal,
      sunsetLocal,
      sunriseIso: today.sunrise ?? "",
      sunsetIso: today.sunset ?? "",
    };

    snapshots.push(snapshot);

    console.log(`\nCity: ${snapshot.name} (${snapshot.slug})`);
    console.log(`Coords: ${snapshot.coords.lat}, ${snapshot.coords.lon} | TZ: ${snapshot.timezone}`);
    console.log(`Temp: ${snapshot.temperature}°C | Feels Like: ${snapshot.feelsLike}°C`);
    console.log(`Wind: ${snapshot.windSpeed} m/s | Humidity: ${snapshot.humidity}% | Pressure: ${snapshot.pressureMmHg} mmHg`);
    console.log(`Condition: ${snapshot.conditionLabel} (Code: ${snapshot.weatherCode})`);
    console.log(`Sunrise Local: ${snapshot.sunriseLocal} | ISO: ${snapshot.sunriseIso}`);
    console.log(`Sunset Local: ${snapshot.sunsetLocal} | ISO: ${snapshot.sunsetIso}`);
  }

  const result: AuditSnapshotResult = {
    timestamp,
    cities: snapshots,
  };

  const outputPath = path.join(process.cwd(), "audit-snapshot-raw.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  console.log(`\nSaved raw snapshot output to: ${outputPath}`);
}

main().catch(console.error);
