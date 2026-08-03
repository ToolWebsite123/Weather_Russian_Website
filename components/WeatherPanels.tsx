import Link from "next/link";
import { formatPressureMmHg, formatTemp, formatWindDir } from "@/lib/cities";
import { ru } from "@/lib/i18n/ru";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { summarizeDayParts } from "@/lib/weather/day-parts";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { CurrentWeather, DailyPoint, HourlyPoint } from "@/types/weather";
import { getPressureTrend, type PressureTrendValue } from "@/lib/weather/pressure-trend";
import { getUvCategory } from "@/lib/weather/uv-scale";

export function PressureTrend({ trend }: { trend: PressureTrendValue }) {
  if (trend === "rising") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 whitespace-nowrap"
        title="Давление растёт"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
        <span>Растёт</span>
      </span>
    );
  }
  if (trend === "falling") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 whitespace-nowrap"
        title="Давление падает"
      >
        <svg
          className="h-3.5 w-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        <span>Падает</span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium text-cloud-500 whitespace-nowrap"
      title="Давление стабильно"
    >
      <svg
        className="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
      <span>Стабильно</span>
    </span>
  );
}

export function CurrentWeatherCard({
  cityName,
  current,
  today,
  hourly,
}: {
  cityName: string;
  current: CurrentWeather;
  today?: DailyPoint;
  hourly?: HourlyPoint[];
}) {
  const trend = getPressureTrend(hourly ?? [], current.time);
  const uvCategory =
    typeof current.uvIndex === "number" ? getUvCategory(current.uvIndex) : null;

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

      <div className="mt-6 border-t border-sky-100/80 pt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-cloud-500 sm:text-xs">
            Давление
          </p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-sky-950 sm:text-base flex items-center flex-wrap gap-1">
            <span>{formatPressureMmHg(current.pressure)}</span>
            <PressureTrend trend={trend} />
          </p>
        </div>
        {typeof current.uvIndex === "number" && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-cloud-500 sm:text-xs">
              УФ-индекс
            </p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-sky-950 sm:text-base flex items-center gap-1.5">
              <span>{current.uvIndex.toFixed(1)}</span>
              {uvCategory && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${uvCategory.colorClass}`}
                >
                  {uvCategory.label}
                </span>
              )}
            </p>
          </div>
        )}
        {typeof current.dewPoint === "number" && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-cloud-500 sm:text-xs">
              Точка росы
            </p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-sky-950 sm:text-base">
              {formatTemp(current.dewPoint)}
            </p>
          </div>
        )}
        {typeof current.visibility === "number" && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-cloud-500 sm:text-xs">
              Видимость
            </p>
            <p className="mt-0.5 text-sm font-medium tabular-nums text-sky-950 sm:text-base">
              {current.visibility >= 1000
                ? `${(current.visibility / 1000).toFixed(1)} км`
                : `${Math.round(current.visibility)} м`}
            </p>
          </div>
        )}
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
            <p className="mt-1 text-[11px] tabular-nums text-cloud-500 text-center">
              {p.precipitation.toFixed(1)} мм
              {typeof p.precipitationProbability === "number" &&
              p.precipitationProbability > 0
                ? ` (${Math.round(p.precipitationProbability)}%)`
                : ""}{" "}
              · {p.windSpeed.toFixed(0)} м/с
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ComfortIndices({
  current,
  hourly,
}: {
  current: CurrentWeather;
  hourly?: HourlyPoint[];
}) {
  const trend = getPressureTrend(hourly ?? [], current.time);
  const uvCategory =
    typeof current.uvIndex === "number" ? getUvCategory(current.uvIndex) : null;

  const windValue =
    current.windGusts && current.windGusts > current.windSpeed + 1
      ? `${current.windSpeed.toFixed(1)} м/с ${formatWindDir(current.windDirection)} (порывы ${current.windGusts.toFixed(1)} м/с)`
      : `${current.windSpeed.toFixed(1)} м/с ${formatWindDir(current.windDirection)}`;

  type ComfortItem = {
    label: string;
    node: React.ReactNode;
  };

  const items: ComfortItem[] = [
    { label: ru.feelsLike, node: formatTemp(current.feelsLike) },
    { label: ru.humidity, node: `${Math.round(current.humidity)}%` },
    { label: ru.wind, node: windValue },
    {
      label: ru.pressure,
      node: (
        <span className="inline-flex flex-wrap items-center gap-1.5">
          <span>{formatPressureMmHg(current.pressure)}</span>
          <PressureTrend trend={trend} />
        </span>
      ),
    },
    {
      label: ru.precipitation,
      node: `${current.precipitation.toFixed(1)} мм`,
    },
    { label: ru.clouds, node: `${Math.round(current.cloudCover)}%` },
  ];

  if (typeof current.uvIndex === "number") {
    items.push({
      label: "УФ-индекс",
      node: (
        <span className="inline-flex items-center gap-1.5">
          <span>{current.uvIndex.toFixed(1)}</span>
          {uvCategory && (
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-semibold ${uvCategory.colorClass}`}
            >
              {uvCategory.label}
            </span>
          )}
        </span>
      ),
    });
  }

  if (typeof current.dewPoint === "number") {
    items.push({
      label: "Точка росы",
      node: formatTemp(current.dewPoint),
    });
  }

  if (typeof current.visibility === "number") {
    items.push({
      label: "Видимость",
      node:
        current.visibility >= 1000
          ? `${(current.visibility / 1000).toFixed(1)} км`
          : `${Math.round(current.visibility)} м`,
    });
  }

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
          <div className="mt-1 text-base font-medium tabular-nums text-sky-950 sm:text-lg">
            {item.node}
          </div>
        </div>
      ))}
    </section>
  );
}

export function SunInfoCard({ today }: { today?: DailyPoint }) {
  if (!today?.sunrise || !today?.sunset) return null;

  const sunriseDate = new Date(today.sunrise);
  const sunsetDate = new Date(today.sunset);

  const sunriseTime = sunriseDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunsetTime = sunsetDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const diffMs = sunsetDate.getTime() - sunriseDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = `${diffHours} ч ${diffMinutes} мин`;

  return (
    <section className="rounded-xl bg-white/80 p-4 ring-1 ring-sky-100 backdrop-blur">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-cloud-500">
        Солнце и световой день
      </h3>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-amber-50/70 p-2.5">
          <p className="text-[11px] font-medium text-amber-800">Восход</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-amber-950">
            🌅 {sunriseTime}
          </p>
        </div>
        <div className="rounded-lg bg-orange-50/70 p-2.5">
          <p className="text-[11px] font-medium text-orange-800">Закат</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-orange-950">
            🌇 {sunsetTime}
          </p>
        </div>
        <div className="rounded-lg bg-sky-50/70 p-2.5">
          <p className="text-[11px] font-medium text-sky-800">Долгота дня</p>
          <p className="mt-1 text-base font-semibold tabular-nums text-sky-950">
            ☀️ {durationStr}
          </p>
        </div>
      </div>
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
  const globalMin = Math.min(...list.map((d) => d.tempMin));
  const globalMax = Math.max(...list.map((d) => d.tempMax));
  const range = Math.max(1, globalMax - globalMin);

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
          const leftPercent = ((d.tempMin - globalMin) / range) * 100;
          const widthPercent = Math.max(6, ((d.tempMax - d.tempMin) / range) * 100);

          return (
            <li key={d.date} className="px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2 text-sm sm:gap-3 sm:text-base">
                <span className="w-24 capitalize text-cloud-600 sm:w-32 shrink-0 truncate">
                  {dateLabel}
                </span>
                <WeatherIcon code={d.weatherCode} size={28} className="shrink-0" />
                <span className="hidden flex-1 text-cloud-600 md:block truncate">
                  {weatherCodeLabel(d.weatherCode)}
                </span>

                <div className="hidden sm:flex flex-1 items-center mx-2 max-w-[140px]">
                  <div className="h-2 w-full rounded-full bg-cloud-100 relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-sun-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <span className="ml-auto tabular-nums text-sky-950 font-medium shrink-0">
                  {formatTemp(d.tempMin)} / {formatTemp(d.tempMax)}
                </span>
                <span className="hidden w-12 text-right tabular-nums text-cloud-500 sm:block shrink-0">
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
