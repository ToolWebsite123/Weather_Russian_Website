import Link from "next/link";
import dynamic from "next/dynamic";
import { formatPressureMmHg, formatTemp, formatWindDir } from "@/lib/cities";
import { ru } from "@/lib/i18n/ru";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { summarizeDayParts } from "@/lib/weather/day-parts";
import { WeatherIcon } from "@/components/WeatherIcon";
import { TemperatureSparkline } from "@/components/TemperatureSparkline";
import type { AirQuality, CurrentWeather, DailyPoint, HourlyPoint } from "@/types/weather";
import { getPressureTrend, type PressureTrendValue } from "@/lib/weather/pressure-trend";
import { getUvCategory } from "@/lib/weather/uv-scale";
import { computeComfortPenalties } from "@/lib/weather/activity-index";

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

  const next5Hours = (() => {
    if (!hourly || hourly.length === 0) return [];
    if (current?.time) {
      const currentPrefix = current.time.slice(0, 13);
      const idx = hourly.findIndex((h) => h.time.startsWith(currentPrefix));
      if (idx !== -1) {
        return hourly.slice(idx, idx + 5);
      }
    }
    return hourly.slice(0, 5);
  })();

  return (
    <section className="rounded-3xl bg-white/95 p-6 sm:p-8 border border-sky-200/90 shadow-xl shadow-sky-900/10 backdrop-blur-md ring-1 ring-white/80 transition-all">
      <div className="flex items-center justify-between gap-2 border-b border-sky-100/90 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-900">
          <span className="h-2 w-2 rounded-full bg-sky-600 animate-pulse" />
          {ru.current}
        </span>
        {today && (
          <span className="text-xs font-semibold text-cloud-600 tabular-nums">
            Макс: <span className="text-sky-950 font-bold">{formatTemp(today.tempMax)}</span> · Мин: <span className="text-sky-950 font-bold">{formatTemp(today.tempMin)}</span>
          </span>
        )}
      </div>

      <h1 className="mt-4 font-serif text-h1 font-bold leading-tight text-sky-950">
        {ru.forecastFor(cityName)}
      </h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <WeatherIcon
            code={current.weatherCode}
            isDay={current.isDay}
            size={96}
            className="shrink-0 transition-transform hover:scale-105"
          />
          <div>
            <div className="flex flex-wrap items-baseline gap-4">
              <p
                key={current.temperature}
                className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tabular-nums leading-none tracking-tighter text-sky-950 animate-temp-settle motion-reduce:animate-none drop-shadow-2xs"
              >
                {formatTemp(current.temperature)}
              </p>
              {hourly && hourly.length > 0 && (
                <TemperatureSparkline
                  hourly={hourly}
                  currentTime={current.time}
                  width={110}
                  height={32}
                  className="self-center"
                />
              )}
            </div>
            <p className="mt-2 text-lg font-semibold text-sky-900 sm:text-xl">
              {weatherCodeLabel(current.weatherCode)}
            </p>
          </div>
        </div>
      </div>

      {next5Hours.length > 0 && (
        <div className="mt-6 border-t border-sky-100/90 pt-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cloud-500">
            {ru.nextHours}
          </p>
          <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:gap-3 sm:px-0 no-scrollbar">
            {next5Hours.map((h) => {
              const label = new Date(h.time).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={h.time}
                  className="flex flex-1 min-w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-2xl bg-sky-50/80 p-3 border border-sky-100/90 shadow-2xs hover:bg-sky-100/80 transition-colors"
                >
                  <span className="text-xs font-medium text-cloud-500 tabular-nums">
                    {label}
                  </span>
                  <WeatherIcon code={h.weatherCode} size={30} className="my-1.5 shrink-0" />
                  <span className="text-base font-bold text-sky-950 tabular-nums">
                    {formatTemp(h.temperature)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-sky-100/90 pt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        <div className="rounded-2xl bg-sky-50/60 p-3.5 border border-sky-100/80">
          <p className="text-[11px] font-medium uppercase tracking-wider text-cloud-500">
            Давление
          </p>
          <p className="mt-1 text-sm font-bold tabular-nums text-sky-950 sm:text-base flex items-center flex-wrap gap-1">
            <span>{formatPressureMmHg(current.pressure)}</span>
            <PressureTrend trend={trend} />
          </p>
        </div>
        {typeof current.uvIndex === "number" && (
          <div className="rounded-2xl bg-sky-50/60 p-3.5 border border-sky-100/80">
            <p className="text-[11px] font-medium uppercase tracking-wider text-cloud-500">
              УФ-индекс
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-sky-950 sm:text-base flex items-center gap-1.5">
              <span>{current.uvIndex.toFixed(1)}</span>
              {uvCategory && (
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${uvCategory.colorClass}`}
                >
                  {uvCategory.label}
                </span>
              )}
            </p>
          </div>
        )}
        {typeof current.dewPoint === "number" && (
          <div className="rounded-2xl bg-sky-50/60 p-3.5 border border-sky-100/80">
            <p className="text-[11px] font-medium uppercase tracking-wider text-cloud-500">
              Точка росы
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-sky-950 sm:text-base">
              {formatTemp(current.dewPoint)}
            </p>
          </div>
        )}
        {typeof current.visibility === "number" && (
          <div className="rounded-2xl bg-sky-50/60 p-3.5 border border-sky-100/80">
            <p className="text-[11px] font-medium uppercase tracking-wider text-cloud-500">
              Видимость
            </p>
            <p className="mt-1 text-sm font-bold tabular-nums text-sky-950 sm:text-base">
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
      <h2 className="mb-2 font-serif text-h2 text-sky-950">По частям суток</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {parts.map((p) => (
          <div
            key={p.key}
            className="flex flex-col items-center rounded-xl bg-white/80 px-2.5 py-3 ring-1 ring-sky-100"
          >
            <p className="text-xs uppercase tracking-wide text-cloud-500">
              {p.label}
            </p>
            <WeatherIcon code={p.weatherCode} size={40} className="my-1.5" />
            <p className="text-xl font-semibold tabular-nums text-sky-950">
              {formatTemp(p.temperature)}
            </p>
            <p className="mt-0.5 text-center text-xs text-cloud-500">
              {weatherCodeLabel(p.weatherCode)}
            </p>
            <p className="mt-0.5 text-[11px] tabular-nums text-cloud-500 text-center">
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
  aqi,
}: {
  current: CurrentWeather;
  hourly?: HourlyPoint[];
  aqi?: AirQuality | null;
}) {
  const trend = getPressureTrend(hourly ?? [], current.time);
  const uvCategory =
    typeof current.uvIndex === "number" ? getUvCategory(current.uvIndex) : null;
  const comfortRes = computeComfortPenalties(current, hourly, aqi);

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
    {
      label: "Комфорт",
      node: (
        <span
          className={`rounded px-1.5 py-0.5 text-xs font-semibold ${comfortRes.comfortLevel.colorClass}`}
        >
          {comfortRes.comfortLevel.label}
        </span>
      ),
    },
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

export function HourlyForecast({ hours }: { hours: HourlyPoint[] }) {
  const next = hours.slice(0, 24);
  return (
    <section>
      <h2 className="mb-2 font-serif text-h2 text-sky-950">{ru.hourly}</h2>
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-2 sm:px-0">
        {next.map((h) => {
          const label = new Date(h.time).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div
              key={h.time}
              className="flex min-w-[4rem] shrink-0 flex-col items-center rounded-xl bg-white/80 px-2 py-2.5 ring-1 ring-sky-100"
            >
              <p className="text-[10px] text-cloud-500 sm:text-xs tabular-nums">{label}</p>
              <WeatherIcon code={h.weatherCode} size={32} className="my-1" />
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
      <h2 className="mb-2 font-serif text-h2 text-sky-950">{ru.daily}</h2>
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
            <li key={d.date} className="px-3 py-2.5 sm:px-4">
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

              {/* Mobile range bar row */}
              <div className="mt-1 sm:hidden flex items-center px-1">
                <div className="h-1.5 w-full rounded-full bg-cloud-100 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-sun-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>

              {parts.length > 0 && (
                <div className="mt-1.5 grid grid-cols-4 gap-1 sm:hidden">
                  {parts.map((p) => (
                    <div
                      key={p.key}
                      className="rounded-lg bg-sky-50/80 px-1 py-1 text-center"
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
  active: "today" | "tomorrow" | "weekend" | "3" | "7" | "10" | "14";
}) {
  const tabs = [
    { id: "today" as const, href: `/pogoda/${slug}`, label: ru.today },
    {
      id: "tomorrow" as const,
      href: `/pogoda/${slug}/zavtra`,
      label: ru.tomorrow,
    },
    {
      id: "weekend" as const,
      href: `/pogoda/${slug}/vykhodnye`,
      label: "Выходные",
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
      <h2 className="mb-3 font-serif text-h2 text-sky-950">Рядом</h2>
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

const DynamicRadarMap = dynamic(() => import("@/components/RadarMap"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:h-96 sm:p-6 animate-pulse flex items-center justify-center text-xs text-cloud-500">
      Загрузка карты погоды…
    </div>
  ),
});

export function WeatherMap(props: {
  latitude: number;
  longitude: number;
  cityName: string;
  showPrecip?: boolean;
}) {
  return <DynamicRadarMap {...props} />;
}
