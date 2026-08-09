import { cookies, headers } from "next/headers";
import { LAST_CITY_COOKIE, RememberLastCity } from "@/components/RememberLastCity";
import { PageShell } from "@/components/SiteChrome";
import { CurrentWeatherCard } from "@/components/WeatherPanels";
import { AlertBanner } from "@/components/AlertBanner";
import { GeoLocationBanner } from "@/components/GeoLocationBanner";
import { fetchGeomagneticData } from "@/lib/weather/geomagnetic";
import {
  getFavoritesForSession,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { resolveCityFromCoords } from "@/lib/weather/geo-resolver";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = cookies();
  const savedCitySlug = store.get(LAST_CITY_COOKIE)?.value;

  let targetCitySlug: string | null = savedCitySlug || null;
  let isIpDetected = false;

  // 1. Only run auto IP-geolocation if LAST_CITY_COOKIE is NOT set (first-time visitor)
  if (!targetCitySlug) {
    const reqHeaders = headers();
    const latStr = reqHeaders.get("x-vercel-ip-latitude");
    const lonStr = reqHeaders.get("x-vercel-ip-longitude");
    const headerCity = reqHeaders.get("x-vercel-ip-city");
    const headerCountry = reqHeaders.get("x-vercel-ip-country");

    if (latStr && lonStr) {
      const lat = parseFloat(latStr);
      const lon = parseFloat(lonStr);
      if (!isNaN(lat) && !isNaN(lon)) {
        let cityName: string | undefined;
        if (headerCity) {
          try {
            cityName = decodeURIComponent(headerCity);
          } catch {
            cityName = headerCity;
          }
        }
        const detected = await resolveCityFromCoords(
          lat,
          lon,
          cityName,
          headerCountry || undefined
        );
        if (detected) {
          targetCitySlug = detected.slug;
          isIpDetected = true;
        }
      }
    }
  }

  // 2. Fall back to default ("moscow") if no cookie and geo detection was empty/failed
  const finalCitySlug = targetCitySlug || "moscow";

  // Load primary weather (target city or fallback to Moscow)
  let primaryData = await loadCityWeather(finalCitySlug);
  if (!primaryData && finalCitySlug !== "moscow") {
    primaryData = await loadCityWeather("moscow");
  }

  const [favorites, geomagneticData] = await Promise.all([
    getFavoritesForSession().catch(() => []),
    fetchGeomagneticData().catch(() => null),
  ]);

  const activeAlerts = primaryData ? getActiveAlerts(primaryData.weather) : [];

  return (
    <PageShell favorites={favorites}>
      {primaryData && <RememberLastCity slug={primaryData.city.slug} />}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-4">
        {isIpDetected && primaryData && (
          <GeoLocationBanner cityName={primaryData.city.name} />
        )}

        {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}

        {primaryData && (
          <CurrentWeatherCard
            cityName={primaryData.city.name}
            citySlug={primaryData.city.slug}
            current={primaryData.weather.current}
            today={primaryData.weather.daily[0]}
            hourly={primaryData.weather.hourly}
            geomagneticKp={geomagneticData?.kp ? Math.round(geomagneticData.kp) : 2}
            timezone={primaryData.weather.timezone || primaryData.city.timezone || undefined}
          />
        )}
      </main>
    </PageShell>
  );
}
