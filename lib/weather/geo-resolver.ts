import { prisma } from "@/lib/prisma";
import { upsertCityFromGeo } from "@/lib/weather/cache";
import { slugifyCity } from "@/lib/cities";
import type { City } from "@prisma/client";

export async function reverseGeocodeCoords(lat: number, lon: number): Promise<{
  name: string;
  nameEn?: string;
  country: string;
  region?: string;
} | null> {
  try {
    // 1. OpenStreetMap / Nominatim Reverse API for high precision village, town, or city name
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`,
      {
        headers: {
          "User-Agent": "WeatherToolApp/1.0",
          "Accept-Language": "ru,en",
        },
        next: { revalidate: 86400 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const cityName =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        data.display_name?.split(",")[0];

      if (cityName) {
        return {
          name: cityName,
          nameEn: addr.city || cityName,
          country: (addr.country_code || "ru").toUpperCase(),
          region: addr.state || addr.region || addr.county,
        };
      }
    }
  } catch {
    // Fallback to DB nearest city lookup
  }

  // 2. Database fallback
  try {
    const cities = await prisma.city.findMany({ take: 100 });
    if (cities.length > 0) {
      const nearest = cities.sort(
        (a: City, b: City) =>
          Math.hypot(lat - a.latitude, lon - a.longitude) -
          Math.hypot(lat - b.latitude, lon - b.longitude)
      )[0];
      return {
        name: nearest.name,
        nameEn: nearest.nameEn || nearest.name,
        country: nearest.country,
        region: nearest.region ?? undefined,
      };
    }
  } catch {}

  return null;
}

export async function resolveCityFromCoords(
  lat: number,
  lon: number,
  fallbackCityName?: string,
  fallbackCountry?: string
): Promise<City | null> {
  try {
    const match = await reverseGeocodeCoords(lat, lon);
    const placeName = match?.name ?? fallbackCityName ?? `Место ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    const slug = slugifyCity(placeName);

    return await upsertCityFromGeo({
      slug,
      name: placeName,
      nameEn: match?.nameEn ?? placeName,
      country: match?.country ?? fallbackCountry ?? "RU",
      region: match?.region,
      latitude: lat,
      longitude: lon,
      tier: 2,
    });
  } catch {
    return null;
  }
}
