import { CitySearch, PopularCityLinks } from "@/components/CitySearch";
import { UseMyLocation } from "@/components/UseMyLocation";
import { PageShell } from "@/components/SiteChrome";
import {
  getFavoritesForSession,
  listPopularCities,
} from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";

export const revalidate = 900;

export default async function Home() {
  const [cities, favorites] = await Promise.all([
    listPopularCities(12).catch(() => []),
    getFavoritesForSession().catch(() => []),
  ]);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="font-serif text-5xl font-semibold tracking-tight text-sky-950 sm:text-6xl">
          {ru.brand}
        </p>
        <h1 className="mt-3 text-xl text-sky-900 sm:text-2xl">{ru.homeTitle}</h1>
        <p className="mt-3 max-w-lg text-cloud-600">{ru.homeSubtitle}</p>

        <div className="mt-8 space-y-4">
          <CitySearch />
          <UseMyLocation />
        </div>

        {cities.length > 0 && (
          <div className="mt-10">
            <p className="mb-3 text-sm uppercase tracking-wide text-cloud-500">
              {ru.popularCities}
            </p>
            <PopularCityLinks cities={cities} />
          </div>
        )}
      </main>
    </PageShell>
  );
}
