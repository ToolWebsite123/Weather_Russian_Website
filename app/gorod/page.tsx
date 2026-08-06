import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAllStaticCities } from "@/lib/weather/static-cities";
import { getFavoritesForSession } from "@/lib/weather/city-page";
import { PageShell } from "@/components/SiteChrome";
import type { City } from "@prisma/client";

export const revalidate = 3600; // 1 hour ISR

export const metadata: Metadata = {
  title: "Все города России — Каталог погоды | WeatherHub",
  description:
    "Полный каталог городов России. Точный прогноз погоды для 272 городов: температура, осадк и, ветер и качество воздуха.",
  alternates: {
    canonical: "https://weatherhub.ru/gorod",
  },
};

async function getCatalogCities(): Promise<City[]> {
  try {
    const cities = await prisma.city.findMany({
      where: { isCurated: true },
      orderBy: [{ name: "asc" }],
    });
    if (cities.length > 0) return cities;
  } catch {
    // Database query fallback to static dataset
  }
  return getAllStaticCities().sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export default async function CityCatalogPage() {
  const [cities, favorites] = await Promise.all([
    getCatalogCities(),
    getFavoritesForSession().catch(() => []),
  ]);

  // Group cities alphabetically by first uppercase Cyrillic letter
  const grouped = new Map<string, City[]>();

  for (const city of cities) {
    const letter = city.name.charAt(0).toUpperCase();
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(city);
  }

  const alphabet = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
        {/* Header */}
        <section className="space-y-3 rounded-2xl bg-white/80 p-6 ring-1 ring-sky-100 shadow-sm backdrop-blur">
          <nav className="text-xs text-cloud-500 flex items-center gap-1.5">
            <Link href="/" className="hover:text-sky-800 transition-colors">
              Главная
            </Link>
            <span>/</span>
            <span className="text-sky-950 font-medium">Каталог городов</span>
          </nav>
          <h1 className="font-serif text-h1 font-bold text-sky-950">
            Погода во всех городах России
          </h1>
          <p className="text-sm text-cloud-600 max-w-2xl leading-relaxed">
            Полный список из {cities.length} городов России. Выберите интересующий город для просмотра подробного прогноза погоды на сегодня, завтра, 3, 7, 10 и 14 дней.
          </p>

          {/* Quick Alphabet Navigation Bar */}
          <div className="pt-3 border-t border-sky-100 flex flex-wrap gap-1.5">
            {alphabet.map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-xs font-semibold text-sky-900 ring-1 ring-sky-200/60 transition-all hover:bg-sky-500 hover:text-white active:scale-95"
              >
                {letter}
              </a>
            ))}
          </div>
        </section>

        {/* Grouped City List */}
        <div className="space-y-6">
          {alphabet.map((letter) => {
            const letterCities = grouped.get(letter) ?? [];
            return (
              <section
                key={letter}
                id={`letter-${letter}`}
                className="scroll-mt-6 rounded-2xl bg-white/70 p-5 ring-1 ring-sky-100 backdrop-blur space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-sky-100/80 pb-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white shadow-sm">
                    {letter}
                  </span>
                  <span className="text-xs text-cloud-400 font-medium">
                    ({letterCities.length} {getCityWordForm(letterCities.length)})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                  {letterCities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/pogoda/${city.slug}`}
                      className="group flex flex-col justify-between rounded-xl bg-white/90 p-3 ring-1 ring-sky-100/80 transition-all duration-150 hover:-translate-y-0.5 hover:bg-sky-50 hover:ring-sky-200 hover:shadow-md motion-reduce:transform-none"
                    >
                      <span className="font-medium text-sm text-sky-950 group-hover:text-sky-700 transition-colors truncate">
                        {city.name}
                      </span>
                      {city.region && (
                        <span className="text-[11px] text-cloud-400 truncate mt-0.5">
                          {city.region}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
}

function getCityWordForm(count: number): string {
  const rem100 = count % 100;
  const rem10 = count % 10;
  if (rem100 >= 11 && rem100 <= 19) return "городов";
  if (rem10 === 1) return "город";
  if (rem10 >= 2 && rem10 <= 4) return "города";
  return "городов";
}
