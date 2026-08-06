import { cookies } from "next/headers";
import { LAST_CITY_COOKIE } from "@/components/RememberLastCity";
import { PageShell } from "@/components/SiteChrome";
import { CurrentWeatherCard, DayPartsGrid, DailyForecast } from "@/components/WeatherPanels";
import { HourlyChart } from "@/components/HourlyChart";
import { AlertBanner } from "@/components/AlertBanner";
import { PopularCitiesGrid } from "@/components/PopularCitiesGrid";
import { WeatherMapPreviewSection } from "@/components/WeatherMapPreviewSection";
import { RelatedArticles } from "@/components/RelatedArticles";
import { PortalSidebar } from "@/components/PortalSidebar";
import { getLatestArticles } from "@/lib/content/articles";
import {
  getFavoritesForSession,
  listPopularCities,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getBatchCachedWeather } from "@/lib/weather/cache";
import { getActiveAlerts } from "@/lib/weather/alerts";

export const revalidate = 900;

export default async function Home() {
  const store = cookies();
  const lastCitySlug = store.get(LAST_CITY_COOKIE)?.value || "moscow";

  // Load primary weather (last city cookie or fallback to Moscow)
  let primaryData = await loadCityWeather(lastCitySlug);
  if (!primaryData && lastCitySlug !== "moscow") {
    primaryData = await loadCityWeather("moscow");
  }

  // Load popular cities, favorites concurrently
  const [popularCitiesList, favorites] = await Promise.all([
    listPopularCities(24).catch(() => []),
    getFavoritesForSession().catch(() => []),
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* Main Weather Stream Column (8 Columns on desktop) */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}

            {primaryData && (
              <>
                {/* Hero Primary Weather Panel */}
                <CurrentWeatherCard
                  cityName={primaryData.city.name}
                  current={primaryData.weather.current}
                  today={primaryData.weather.daily[0]}
                  hourly={primaryData.weather.hourly}
                />

                {/* 24-Hour Temperature Curve Chart */}
                <HourlyChart hours={primaryData.weather.hourly} />

                {/* Dayparts Breakdown (Morning, Afternoon, Evening, Night) */}
                {focusDate && (
                  <DayPartsGrid
                    hourly={primaryData.weather.hourly}
                    date={focusDate}
                  />
                )}

                {/* Extended Daily Forecast */}
                <DailyForecast
                  days={primaryData.weather.daily}
                  hourly={primaryData.weather.hourly}
                />
              </>
            )}

            {/* Popular Cities Weather Grid (24 Cities) */}
            <PopularCitiesGrid items={popularCityItems} />

            {/* Interactive Weather Radar Section */}
            <div id="weather-map">
              <WeatherMapPreviewSection />
            </div>

            {/* Featured Weather Articles Grid */}
            <RelatedArticles articles={latestArticles.slice(0, 3)} layout="grid" showViewAll />
          </div>

          {/* Right Portal Sidebar (4 Columns on desktop) */}
          <div className="lg:col-span-4">
            <PortalSidebar articles={latestArticles} />
          </div>
        </div>
      </main>
    </PageShell>
  );
}
