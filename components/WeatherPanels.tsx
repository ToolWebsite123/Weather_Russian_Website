import Link from "next/link";
import { formatTemp, formatWindDir } from "@/lib/cities";
import { ru } from "@/lib/i18n/ru";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { summarizeDayParts } from "@/lib/weather/day-parts";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { CurrentWeather, DailyPoint, HourlyPoint } from "@/types/weather";

export function CurrentWeatherCard({
  cityName,
  current,
  today,
}: {
  cityName: string;
  current: CurrentWeather;
  today?: DailyPoint;
}) {
  return (
    <section className="rounded-2xl bg-white/80 p-5 shadow-sm ring-1 ring-sky-100 backdrop-blur sm:p-8">
      <p className="text-xs uppercase tracking-wide text-cloud-500 sm:text-sm">
        {ru.current}
      </p>
      <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-sky-950 sm:text-4xl">
        {ru.forecastFor(cityName)}
      </h1>
      <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-8">
        <WeatherIcon
          code={current.weatherCode}
          isDay={current.isDay}
          size={72}
          className="shrink-0"
        />
        <div>
          <p className="text-6xl font-semibold tabular-nums leading-none text-sky-950 sm:text-7xl">
            {formatTemp(current.temperature)}
          </p>
          <p className="mt-2 text-base text-cloud-600 sm:text-lg">
            {weatherCodeLabel(current.weatherCode)}
          </p>
          {today && (
            <p className="mt-1 text-sm text-cloud-500">
              {formatTemp(today.tempMin)} … {formatTemp(today.tempMax)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function DayPartsGrid({
  hourly,
  date,
}: {
  hourly: HourlyPoint[];
  date: string;
}) {
  const parts = summarizeDayParts(hourly, date);
  if (parts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-sky-950">По частям суток</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {parts.map((p) => (
          <div
            key={p.key}
            className="flex flex-col items-center rounded-xl bg-white/80 px-3 py-4 ring-1 ring-sky-100"
          >
            <p className="text-xs uppercase tracking-wide text-cloud-500">
              {p.label}
            </p>
            <WeatherIcon code={p.weatherCode} size={40} className="my-2" />
            <p className="text-xl font-semibold tabular-nums text-sky-950">
              {formatTemp(p.temperature)}
            </p>
            <p className="mt-1 text-center text-xs text-cloud-500">
              {weatherCodeLabel(p.weatherCode)}
            </p>
            <p className="mt-1 text-xs tabular-nums text-cloud-400">
              {p.precipitation.toFixed(1)} мм · {p.windSpeed.toFixed(0)} м/с
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComfortIndices({ current }: { current: CurrentWeather }) {
  const items = [
    { label: ru.feelsLike, value: formatTemp(current.feelsLike) },
    { label: ru.humidity, value: `${Math.round(current.humidity)}%` },
    {
      label: ru.wind,
      value: `${current.windSpeed.toFixed(1)} м/с ${formatWindDir(current.windDirection)}`,
    },
    { label: ru.pressure, value: `${Math.round(current.pressure)} гПа` },
    {
      label: ru.precipitation,
      value: `${current.precipitation.toFixed(1)} мм`,
    },
    { label: ru.clouds, value: `${Math.round(current.cloudCover)}%` },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl bg-white/80 px-3 py-3 ring-1 ring-sky-100 sm:px-4"
        >
          <p className="text-[10px] uppercase tracking-wide text-cloud-500 sm:text-xs">
            {item.label}
          </p>
          <p className="mt-1 text-base font-medium tabular-nums text-sky-950 sm:text-lg">
            {item.value}
          </p>
        </div>
      ))}
    </section>
  );
}

export function HourlyForecast({ hours }: { hours: HourlyPoint[] }) {
  const next = hours.slice(0, 24);
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-sky-950">{ru.hourly}</h2>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {next.map((h) => {
          const label = new Date(h.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={h.time}
              className="flex min-w-[4.25rem] shrink-0 flex-col items-center rounded-xl bg-white/80 px-2 py-3 ring-1 ring-sky-100"
            >
              <p className="text-[10px] text-cloud-500 sm:text-xs">{label}</p>
              <WeatherIcon code={h.weatherCode} size={32} className="my-1.5" />
              <p className="text-sm font-medium tabular-nums text-sky-950">
                {formatTemp(h.temperature)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function DailyForecast({
  days,
  hourly,
  limit,
}: {
  days: DailyPoint[];
  hourly?: HourlyPoint[];
  limit?: number;
}) {
  const list = limit ? days.slice(0, limit) : days;
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-sky-950">{ru.daily}</h2>
      <ul className="divide-y divide-sky-100 overflow-hidden rounded-xl bg-white/80 ring-1 ring-sky-100">
        {list.map((d) => {
          const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString(
            "ru-RU",
            { weekday: "short", day: "numeric", month: "short" },
          );
          const parts = hourly ? summarizeDayParts(hourly, d.date) : [];
          return (
            <li key={d.date} className="px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2 text-sm sm:gap-3 sm:text-base">
                <span className="w-24 capitalize text-cloud-600 sm:w-36">
                  {dateLabel}
                </span>
                <WeatherIcon code={d.weatherCode} size={28} />
                <span className="hidden flex-1 text-cloud-600 sm:block">
                  {weatherCodeLabel(d.weatherCode)}
                </span>
                <span className="ml-auto tabular-nums text-sky-950">
                  {formatTemp(d.tempMin)} / {formatTemp(d.tempMax)}
                </span>
                <span className="hidden w-14 text-right tabular-nums text-cloud-500 sm:block">
                  {d.precipitationSum.toFixed(1)}
                </span>
              </div>
              {parts.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1 sm:hidden">
                  {parts.map((p) => (
                    <div
                      key={p.key}
                      className="rounded-lg bg-sky-50/80 px-1 py-1.5 text-center"
                    >
                      <p className="text-[9px] text-cloud-500">{p.label}</p>
                      <p className="text-xs font-medium tabular-nums">
                        {formatTemp(p.temperature)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ForecastTabs({
  slug,
  active,
}: {
  slug: string;
  active: "today" | "tomorrow" | "3" | "7" | "10" | "14";
}) {
  const tabs = [
    { id: "today" as const, href: `/pogoda/${slug}`, label: ru.today },
    {
      id: "tomorrow" as const,
      href: `/pogoda/${slug}/zavtra`,
      label: ru.tomorrow,
    },
    { id: "3" as const, href: `/pogoda/${slug}/3-dnya`, label: ru.days3 },
    { id: "7" as const, href: `/pogoda/${slug}/7-dney`, label: ru.days7 },
    { id: "10" as const, href: `/pogoda/${slug}/10-dney`, label: ru.days10 },
    { id: "14" as const, href: `/pogoda/${slug}/14-dney`, label: ru.days14 },
  ];

  return (
    <nav
      className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto border-b border-sky-100/80 bg-sky-50/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:border-sky-100 sm:bg-white/80"
      aria-label="Период прогноза"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={
              isActive
                ? "shrink-0 rounded-full bg-sky-700 px-3 py-1.5 text-sm font-medium text-white"
                : "shrink-0 rounded-full bg-white/90 px-3 py-1.5 text-sm text-sky-800 ring-1 ring-sky-100 hover:bg-sky-50"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function NearbyCities({
  cities,
}: {
  cities: { slug: string; name: string }[];
}) {
  if (cities.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-sky-950">Рядом</h2>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={`/pogoda/${c.slug}`}
            className="rounded-full bg-white/80 px-3 py-1.5 text-sm text-sky-900 ring-1 ring-sky-100 hover:bg-sun-50"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function WeatherMap({
  latitude,
  longitude,
  cityName,
  showPrecip = false,
}: {
  latitude: number;
  longitude: number;
  cityName: string;
  showPrecip?: boolean;
}) {
  const owKey = process.env.NEXT_PUBLIC_OPENWEATHER_MAP_KEY;
  const zoom = 8;
  const tile =
    showPrecip && owKey
      ? `https://tile.openweathermap.org/map/precipitation_new/${zoom}/{x}/{y}.png?appid=${owKey}`
      : null;

  // Client overlay map is a separate component; server fallback uses OSM + optional RainViewer link
  const delta = 0.4;
  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join("%2C");
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const rainViewer = `https://www.rainviewer.com/map.html?loc=${latitude},${longitude},8`;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-xl text-sky-950">{ru.map}</h2>
        <a
          href={rainViewer}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-sky-700 underline underline-offset-2"
        >
          Осадки (RainViewer)
        </a>
      </div>
      <div className="overflow-hidden rounded-xl ring-1 ring-sky-100">
        <iframe
          title={`${ru.map}: ${cityName}`}
          src={osmSrc}
          className="h-56 w-full border-0 sm:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      {tile && (
        <p className="mt-2 text-xs text-cloud-500">
          Слой осадков OpenWeatherMap доступен (ключ настроен).
        </p>
      )}
      <p className="mt-2 text-xs text-cloud-500">
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=10/${latitude}/${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          OpenStreetMap
        </a>
      </p>
    </section>
  );
}
