"use client";

import { useState } from "react";
import Link from "next/link";
import { formatTemp } from "@/lib/cities";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { WeatherIcon } from "@/components/WeatherIcon";
import { SectionHeading } from "@/components/SectionHeading";
import type { City } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";

export type PopularCityItem = {
  city: City;
  weather: WeatherBundle | null;
};

export function PopularCitiesGrid({
  items,
}: {
  items: PopularCityItem[];
  totalCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!items || items.length === 0) return null;

  const initialCount = 12;
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <section className="space-y-4">
      <SectionHeading
        action={
          <Link
            href="/gorod"
            className="text-xs font-medium text-sky-800 hover:text-sky-950 transition-colors"
          >
            Каталог городов →
          </Link>
        }
      >
        Популярные города
      </SectionHeading>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visibleItems.map(({ city, weather }) => {
          const showRegion =
            city.region &&
            city.region.trim().toLowerCase() !== city.name.trim().toLowerCase();

          return (
            <Link
              key={city.slug}
              href={`/pogoda/${city.slug}`}
              className="group flex flex-col justify-between rounded-2xl bg-white/95 p-4 border border-sky-200/90 shadow-md shadow-sky-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-50/70 hover:shadow-lg hover:border-sky-300 backdrop-blur-md motion-reduce:transform-none"
            >
              <div>
                <p className="font-bold text-sky-950 transition-colors group-hover:text-sky-700 truncate">
                  {city.name}
                </p>
                {showRegion && (
                  <p className="text-[11px] text-cloud-500 font-medium truncate mt-0.5">
                    {city.region}
                  </p>
                )}
              </div>

              {weather ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-2xl font-black tabular-nums text-sky-950 tracking-tight">
                      {formatTemp(weather.current.temperature)}
                    </p>
                    <p className="text-[11px] text-cloud-600 truncate font-medium">
                      {weatherCodeLabel(weather.current.weatherCode)}
                    </p>
                  </div>
                  <WeatherIcon
                    code={weather.current.weatherCode}
                    isDay={weather.current.isDay}
                    size={36}
                    className="shrink-0 transition-transform group-hover:scale-110"
                  />
                </div>
              ) : (
                <p className="mt-3 text-xs text-cloud-400">Прогноз недоступен</p>
              )}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 transition-all hover:bg-sky-100 active:scale-95"
          >
            <span>Показать ещё 12 городов</span>
            <span>↓</span>
          </button>
        )}
        <Link
          href="/gorod"
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors ml-auto"
        >
          <span>Полный каталог городов России и мира</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  );
}
