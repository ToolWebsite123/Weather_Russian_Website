import type { Metadata } from "next";
import Link from "next/link";
import { getFavoritesForSession } from "@/lib/weather/city-page";
import { getAllCatalogCountries } from "@/lib/weather/countries";
import { PageShell } from "@/components/SiteChrome";
import { config } from "@/lib/config";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "Каталог стран и городов — Прогноз погоды | WeatherHub",
  description:
    "Полный каталог стран и известных городов мира (Пакистан, Россия, Турция, ОАЭ, Казахстан, Египет, США и др.). Точный прогноз погоды: температура, осадки, ветер и качество воздуха.",
  alternates: {
    canonical: `${config.siteUrl}/gorod`,
  },
};

export default async function CityCatalogPage() {
  const [countries, favorites] = await Promise.all([
    getAllCatalogCountries(),
    getFavoritesForSession().catch(() => []),
  ]);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <section className="space-y-4 rounded-2xl bg-white/85 p-6 ring-1 ring-sky-100 shadow-sm backdrop-blur">
          <nav className="text-xs text-cloud-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-sky-800 transition-colors">
              Главная
            </Link>
            <span>/</span>
            <span className="text-sky-950 font-medium">Каталог стран и городов</span>
          </nav>

          <h1 className="font-serif text-h1 font-bold text-sky-950">
            Погода по странам и городам мира
          </h1>

          <p className="text-sm text-cloud-600 max-w-2xl leading-relaxed">
            Выберите страну или известный город для просмотра точного прогноза погоды. Пакистан, Россия, Турция, ОАЭ, Казахстан, Египет, США и многие другие страны мира.
          </p>

          {/* Quick Country Navigation Chips Bar */}
          <div className="pt-3 border-t border-sky-100 flex flex-wrap gap-2">
            {countries.map((country) => (
              <a
                key={country.iso}
                href={`#country-${country.iso}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-200/70 transition-all hover:bg-sky-500 hover:text-white active:scale-95 shadow-sm"
              >
                <span>{country.flag}</span>
                <span>{country.nameRu}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Country Sections with Regional Hierarchy */}
        <div className="space-y-6">
          {countries.map((country) => (
            <section
              key={country.iso}
              id={`country-${country.iso}`}
              className="scroll-mt-6 rounded-2xl bg-white/80 p-6 ring-1 ring-sky-100 backdrop-blur space-y-5 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl" role="img" aria-label={country.nameRu}>
                    {country.flag}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-sky-950">
                      {country.nameRu}
                    </h2>
                    <p className="text-xs text-cloud-500 mt-0.5">
                      Основные города ({country.cities.length})
                    </p>
                  </div>
                </div>

                <a
                  href="#top"
                  className="text-xs font-medium text-sky-700 hover:text-sky-900 transition-colors"
                >
                  Наверх ↑
                </a>
              </div>

              {/* Unified 6-Column Cities Grid matching Image 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2 text-xs sm:text-sm pt-1">
                {country.cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/pogoda/${city.slug}`}
                    prefetch={true}
                    className="block text-[#0077ff] hover:underline transition-colors font-normal truncate"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
