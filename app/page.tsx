import { cookies } from "next/headers";
import { LAST_CITY_COOKIE } from "@/components/RememberLastCity";
import { CitySearch } from "@/components/CitySearch";
import { UseMyLocation } from "@/components/UseMyLocation";
import { PageShell } from "@/components/SiteChrome";
import { CurrentWeatherCard } from "@/components/WeatherPanels";
import { AlertBanner } from "@/components/AlertBanner";
import { PopularCitiesGrid } from "@/components/PopularCitiesGrid";
import {
  getFavoritesForSession,
  listPopularCities,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getCachedWeatherForCity } from "@/lib/weather/cache";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { ru } from "@/lib/i18n/ru";

export const revalidate = 900;

export default async function Home() {
  const store = cookies();
  const lastCitySlug = store.get(LAST_CITY_COOKIE)?.value || "moscow";

  // Load primary weather (last city cookie or fallback to Moscow)
  let primaryData = await loadCityWeather(lastCitySlug);
  if (!primaryData && lastCitySlug !== "moscow") {
    primaryData = await loadCityWeather("moscow");
  }

  // Load popular cities and user favorites concurrently
  const [popularCitiesList, favorites] = await Promise.all([
    listPopularCities(12).catch(() => []),
    getFavoritesForSession().catch(() => []),
  ]);

  // Fetch live weather for popular cities in parallel using database cache
  const popularCityItems = await Promise.all(
    popularCitiesList.map(async (city) => {
      try {
        const weather = await getCachedWeatherForCity(city);
        return { city, weather };
      } catch {
        return { city, weather: null };
      }
    }),
  );

  const activeAlerts = primaryData ? getActiveAlerts(primaryData.weather) : [];

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:py-8 sm:px-6">
        {activeAlerts.length > 0 && <AlertBanner alerts={activeAlerts} />}

        {primaryData && (
          <CurrentWeatherCard
            cityName={primaryData.city.name}
            current={primaryData.weather.current}
            today={primaryData.weather.daily[0]}
            hourly={primaryData.weather.hourly}
          />
        )}

        <section className="rounded-2xl bg-white/70 p-5 ring-1 ring-sky-100 backdrop-blur sm:p-6">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-cloud-500 font-semibold sm:text-sm">
            Выбрать другой город
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 min-w-0 max-w-xl">
              <CitySearch />
            </div>
            <UseMyLocation />
          </div>
        </section>

        <PopularCitiesGrid items={popularCityItems} />
      </main>
    </PageShell>
  );
}
