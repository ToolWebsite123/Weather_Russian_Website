import { cookies, headers } from "next/headers";
import { LAST_CITY_COOKIE, RememberLastCity } from "@/components/RememberLastCity";
import { PageShell } from "@/components/SiteChrome";
import { CurrentWeatherCard, DayPartsGrid, DailyForecast } from "@/components/WeatherPanels";
import { HourlyChart } from "@/components/HourlyChart";
import { AlertBanner } from "@/components/AlertBanner";
import { PopularCitiesGrid } from "@/components/PopularCitiesGrid";
import { WeatherMapPreviewSection } from "@/components/WeatherMapPreviewSection";
import { RelatedArticles } from "@/components/RelatedArticles";
import { EnvironmentalInsightsBar, RegionalShortcutsBar } from "@/components/PortalSidebar";
import { GeoLocationBanner } from "@/components/GeoLocationBanner";
import { getLatestArticles } from "@/lib/content/articles";
import { fetchAirQuality } from "@/lib/weather/air-quality";
import { fetchGeomagneticData } from "@/lib/weather/geomagnetic";
import {
  getFavoritesForSession,
  listPopularCities,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getBatchCachedWeather } from "@/lib/weather/cache";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { resolveCityFromCoords } from "@/lib/weather/geo-resolver";

// Option B: This route uses per-request cookies() and headers() to serve personalized weather
// (last visited city or IP-based geolocation detection) on initial server-side render.
// In Next.js App Router, using cookies() and headers() forces fully dynamic SSR per request.
// We explicitly export force-dynamic to reflect the actual rendering strategy and avoid misleading revalidate configs.
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

  // Load popular cities, favorites, aqi, and geomagnetic data concurrently
  const [popularCitiesList, favorites, aqiData, geomagneticData] = await Promise.all([
    listPopularCities(24).catch(() => []),
    getFavoritesForSession().catch(() => []),
    primaryData ? fetchAirQuality(primaryData.city.latitude, primaryData.city.longitude).catch(() => null) : Promise.resolve(null),
    fetchGeomagneticData().catch(() => null),
  ]);

  // Fetch cached weather payloads for popular cities in 1 fast batch query (~5ms)
  const weatherMap = await getBatchCachedWeather(popularCitiesList);
  const popularCityItems = popularCitiesList.map((city) => ({
    city,
    weather: weatherMap[city.id] ?? null,
  }));

  const activeAlerts = primaryData ? getActiveAlerts(primaryData.weather) : [];
  const latestArticles = getLatestArticles(5);

  const focusDate = primaryData?.weather.daily[0]?.date;

  return (
    <PageShell favorites={favorites}>
      {primaryData && <RememberLastCity slug={primaryData.city.slug} />}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 sm:space-y-10">
        {isIpDetected && primaryData && (
          <GeoLocationBanner cityName={primaryData.city.name} />
        )}

        {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}

        {primaryData && (
          <>
            {/* 1. Hero Primary Weather Panel */}
            <CurrentWeatherCard
              cityName={primaryData.city.name}
              current={primaryData.weather.current}
              today={primaryData.weather.daily[0]}
              hourly={primaryData.weather.hourly}
            />

            {/* 2. Environmental & Geomagnetic Insights Bar */}
            <EnvironmentalInsightsBar
              aqi={aqiData}
              geomagnetic={geomagneticData}
              current={primaryData.weather.current}
            />

            {/* 3. 24-Hour Temperature Curve Chart */}
            <HourlyChart hours={primaryData.weather.hourly} />

            {/* 4. Dayparts Breakdown (Morning, Afternoon, Evening, Night) */}
            {focusDate && (
              <DayPartsGrid
                hourly={primaryData.weather.hourly}
                date={focusDate}
              />
            )}

            {/* 5. Extended Daily Forecast */}
            <DailyForecast
              days={primaryData.weather.daily}
              hourly={primaryData.weather.hourly}
            />
          </>
        )}

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" aria-hidden="true" />

        {/* 6. Regional Quick Navigator Pill Strip */}
        <RegionalShortcutsBar />

        {/* 7. Popular Cities Weather Grid (24 Cities) */}
        <PopularCitiesGrid items={popularCityItems} />

        {/* 8. Related Articles Section */}
        {latestArticles.length > 0 && (
          <RelatedArticles articles={latestArticles} showViewAll />
        )}

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" aria-hidden="true" />

        {/* 9. Interactive Weather Radar Section */}
        <div id="weather-map">
          <WeatherMapPreviewSection />
        </div>

      </main>
    </PageShell>
  );
}
