import { cookies, headers } from "next/headers";
import { LAST_CITY_COOKIE, RememberLastCity } from "@/components/RememberLastCity";
import { PageShell } from "@/components/SiteChrome";
import { CurrentWeatherCard, DayPartsGrid, DailyForecast } from "@/components/WeatherPanels";
import { HourlyChart } from "@/components/HourlyChart";
import { AlertBanner } from "@/components/AlertBanner";
import { PopularCitiesGrid } from "@/components/PopularCitiesGrid";
import { WeatherMapPreviewSection } from "@/components/WeatherMapPreviewSection";
import { EnvironmentalInsightsBar, RegionalShortcutsBar } from "@/components/PortalSidebar";
import {
  getFavoritesForSession,
  listPopularCities,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getBatchCachedWeather } from "@/lib/weather/cache";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { resolveCityFromGeo } from "@/lib/weather/geo";
import { LocationFallbackBanner } from "@/components/LocationFallbackBanner";
import { PreciseLocationBanner } from "@/components/PreciseLocationBanner";

export const revalidate = 900;

export default async function Home() {
  const store = cookies();
  const lastCityCookie = store.get(LAST_CITY_COOKIE)?.value;

  let targetSlug = lastCityCookie;
  let isAutoDetected = false;
  let showFallbackBanner = false;

  // 1. RETURNING USER CHECK: If wh_last_city cookie exists, skip auto-detection.
  // 2. SILENT SERVER-SIDE IP DETECTION: For first-time visitors (no cookie), inspect Vercel headers.
  if (!targetSlug) {
    const headersList = headers();
    const ipCity = headersList.get("x-vercel-ip-city");
    const ipLatStr = headersList.get("x-vercel-ip-latitude");
    const ipLonStr = headersList.get("x-vercel-ip-longitude");

    const lat = ipLatStr ? parseFloat(ipLatStr) : NaN;
    const lon = ipLonStr ? parseFloat(ipLonStr) : NaN;

    if (!isNaN(lat) && !isNaN(lon)) {
      try {
        const decodedCity = ipCity ? decodeURIComponent(ipCity) : undefined;
        const resolvedCity = await resolveCityFromGeo(lat, lon, decodedCity);
        if (resolvedCity) {
          targetSlug = resolvedCity.slug;
          isAutoDetected = true;
        }
      } catch (err) {
        console.error("Auto location detection failed:", err);
      }
    }

    // 4. FALLBACK CHAIN: If Vercel geo headers are missing or lookup fails, default to "moscow".
    if (!targetSlug) {
      targetSlug = "moscow";
      showFallbackBanner = true;
    }
  }

  // Load primary weather (target slug or fallback to Moscow)
  let primaryData = await loadCityWeather(targetSlug);
  if (!primaryData && targetSlug !== "moscow") {
    primaryData = await loadCityWeather("moscow");
  }

  // Load popular cities, favorites concurrently
  const [popularCitiesList, favorites] = await Promise.all([
    listPopularCities(24).catch(() => []),
    getFavoritesForSession().catch(() => []),
  ]);

  // Fetch cached weather payloads for popular cities
  const weatherMap = await getBatchCachedWeather(popularCitiesList);
  const popularCityItems = popularCitiesList.map((city) => ({
    city,
    weather: weatherMap[city.id] ?? null,
  }));

  const activeAlerts = primaryData ? getActiveAlerts(primaryData.weather) : [];
  const focusDate = primaryData?.weather.daily[0]?.date;

  return (
    <PageShell favorites={favorites}>
      {/* 5. SET THE COOKIE AFTER AUTO-DETECTION */}
      {primaryData && <RememberLastCity slug={primaryData.city.slug} />}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* 4. Location detection fallback banner (when headers missing / detection failed) */}
        {showFallbackBanner && <LocationFallbackBanner />}

        {/* 6. PRECISE LOCATION UPGRADE: Opt-in banner shown for IP-detected visitors */}
        {isAutoDetected && <PreciseLocationBanner />}

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
            <EnvironmentalInsightsBar />

            {/* 3. 24-Hour Temperature Curve Chart */}
            <HourlyChart hours={primaryData.weather.hourly} />

            {/* 4. Dayparts Breakdown */}
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

        {/* 7. Popular Cities Weather Grid */}
        <PopularCitiesGrid items={popularCityItems} />

        <div className="my-6 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" aria-hidden="true" />

        {/* 8. Interactive Weather Radar Section */}
        <div id="weather-map">
          <WeatherMapPreviewSection />
        </div>
      </main>
    </PageShell>
  );
}
