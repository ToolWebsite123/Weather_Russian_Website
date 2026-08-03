import Link from "next/link";
import { formatTemp } from "@/lib/cities";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { City } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";

export type PopularCityItem = {
  city: City;
  weather: WeatherBundle | null;
};

export function PopularCitiesGrid({ items }: { items: PopularCityItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-wide text-cloud-500 font-semibold sm:text-sm">
        Популярные города
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map(({ city, weather }) => (
          <Link
            key={city.slug}
            href={`/pogoda/${city.slug}`}
            className="group flex flex-col justify-between rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm transition-all hover:bg-sky-50/60 hover:shadow-md hover:ring-sky-200 backdrop-blur"
          >
            <div>
              <p className="font-semibold text-sky-950 transition-colors group-hover:text-sky-700 truncate">
                {city.name}
              </p>
              {city.region && (
                <p className="text-[11px] text-cloud-400 truncate">
                  {city.region}
                </p>
              )}
            </div>

            {weather ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums text-sky-950">
                    {formatTemp(weather.current.temperature)}
                  </p>
                  <p className="text-xs text-cloud-500 truncate">
                    {weatherCodeLabel(weather.current.weatherCode)}
                  </p>
                </div>
                <WeatherIcon
                  code={weather.current.weatherCode}
                  isDay={weather.current.isDay}
                  size={36}
                  className="shrink-0 transition-transform group-hover:scale-105"
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-cloud-400">Прогноз недоступен</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
