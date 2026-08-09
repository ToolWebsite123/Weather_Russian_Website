"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { formatPressureMmHg, formatTimeAgo, formatWindDir } from "@/lib/cities";
import { useUnit } from "@/components/UnitContext";
import { ru } from "@/lib/i18n/ru";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { summarizeDayParts } from "@/lib/weather/day-parts";
import { WeatherIcon } from "@/components/WeatherIcon";
import type { AirQuality, CurrentWeather, DailyPoint, HourlyPoint } from "@/types/weather";
import { getPressureTrend, type PressureTrendValue } from "@/lib/weather/pressure-trend";
import { getUvCategory } from "@/lib/weather/uv-scale";
import { computeComfortPenalties } from "@/lib/weather/activity-index";
import { LiveCityDate } from "@/components/LiveCityDate";

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

export function SunArcTimeline({
  sunrise,
  sunset,
  timezone,
}: {
  sunrise?: string;
  sunset?: string;
  timezone?: string;
}) {
  if (!sunrise || !sunset) return null;

  const sunriseStr = new Date(sunrise).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "Europe/Moscow",
  });
  const sunsetStr = new Date(sunset).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || "Europe/Moscow",
  });

  const now = new Date();
  const srDate = new Date(sunrise);
  const ssDate = new Date(sunset);

  const totalMs = ssDate.getTime() - srDate.getTime();
  const elapsedMs = now.getTime() - srDate.getTime();
  const progress = Math.max(0, Math.min(1, elapsedMs / totalMs));
  const isDay = now >= srDate && now <= ssDate;

  const x = 15 + 170 * progress;
  const y = 50 - 90 * progress * (1 - progress);

  return (
    <div className="rounded-xl bg-gradient-to-b from-sky-50/80 to-amber-50/50 p-3 ring-1 ring-sky-100/70 mt-3 text-xs">
      <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
        <span className="flex items-center gap-1 text-amber-700">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v6" />
            <path d="M4.93 10.93l4.24 4.24" />
            <path d="M2 18h20" />
            <path d="M20 10l-4 4" />
            <path d="M12 18a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6z" />
          </svg>
          Восход {sunriseStr}
        </span>
        <span className="text-[11px] text-slate-500 font-normal">Солнце в зените</span>
        <span className="flex items-center gap-1 text-amber-900">
          Закат {sunsetStr}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 10V4" />
            <path d="M4.93 10.93l4.24 4.24" />
            <path d="M2 18h20" />
            <path d="M12 18a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6z" />
          </svg>
        </span>
      </div>

      <div className="relative h-12 w-full">
        <svg viewBox="0 0 200 60" className="w-full h-full overflow-visible">
          <line x1="10" y1="50" x2="190" y2="50" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 15 50 Q 100 5 185 50" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

          {isDay ? (
            <g transform={`translate(${x}, ${y})`}>
              <circle r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <circle r="10" fill="#fef08a" opacity="0.4" />
            </g>
          ) : (
            <g transform="translate(100, 50)">
              <circle r="5" fill="#94a3b8" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export function CategoryTabBar({
  slug,
  active = "now",
  anchorPrefix = "",
}: {
  slug: string;
  active?: string;
  anchorPrefix?: string;
}) {
  const activeNormalized =
    {
      tomorrow: "zavtra",
      weekend: "vykhodnye",
      "3": "3-dnya",
      "7": "7-dney",
      "10": "10-dney",
      "14": "14-dney",
      archive: "archiv",
    }[active] || active;

  const tabs = [
    { id: "vchera", href: `/pogoda/${slug}/vchera`, label: "Вчера" },
    { id: "now", href: `/pogoda/${slug}`, label: "Сейчас" },
    { id: "today", href: `/pogoda/${slug}`, label: ru.today },
    { id: "zavtra", href: `/pogoda/${slug}/zavtra`, label: ru.tomorrow },
    { id: "3-dnya", href: `/pogoda/${slug}/3-dnya`, label: ru.days3 },
    { id: "vykhodnye", href: `/pogoda/${slug}/vykhodnye`, label: "Выходные" },
    { id: "7-dney", href: `/pogoda/${slug}/7-dney`, label: ru.days7 },
    { id: "10-dney", href: `/pogoda/${slug}/10-dney`, label: ru.days10 },
    { id: "14-dney", href: `/pogoda/${slug}/14-dney`, label: ru.days14 },
    { id: "mesyats", href: `/pogoda/${slug}/mesyats`, label: "Месяц" },
    { id: "archiv", href: `/pogoda/${slug}/archiv`, label: "Архив" },
  ];

  return (
    <div className="sticky top-[53px] sm:top-[57px] z-20 w-full border-b border-[#0b2e2b] bg-[#0f3d3a] shadow-md">
      <div className="mx-auto max-w-7xl px-4 py-1.5 sm:px-6">
        <nav
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-sm"
          aria-label="Категории и период прогноза"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeNormalized;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`inline-block px-3.5 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-white text-[#0f3d3a] font-semibold shadow-xs"
                    : "text-[#bcd8d4] hover:bg-white/10"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}

          <span
            className="inline-block w-px h-4 bg-[#2e6a63] mx-1.5 align-middle shrink-0"
            aria-hidden="true"
          />

          <a
            href={`${anchorPrefix}#weather-map`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm text-[#bcd8d4] hover:bg-white/10 transition-colors align-middle shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a7 7 0 1 0 10 10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Радар</span>
          </a>

          <a
            href={`${anchorPrefix}#environmental-insights`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm text-[#bcd8d4] hover:bg-white/10 transition-colors align-middle shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7a9 9 0 0 1-10 11z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span>Пыльца</span>
          </a>

          <a
            href={`${anchorPrefix}#road-conditions`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm text-[#bcd8d4] hover:bg-white/10 transition-colors align-middle shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="8" rx="2" />
              <circle cx="7" cy="15" r="1.5" />
              <circle cx="17" cy="15" r="1.5" />
              <path d="M5 11l2-5h10l2 5" />
            </svg>
            <span>Дороги</span>
          </a>

          <a
            href={`${anchorPrefix}#geomagnetic`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm text-[#bcd8d4] hover:bg-white/10 transition-colors align-middle shrink-0"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 15v-2a6 6 0 1 1 12 0v2" />
              <path d="M6 15h4v5H6zM14 15h4v5h-4z" />
            </svg>
            <span>Г/м активность</span>
          </a>
        </nav>
      </div>
    </div>
  );
}

export function CurrentWeatherCard({
  cityName,
  citySlug,
  current,
  today,
  hourly,
  geomagneticKp = 2,
  timezone,
  fetchedAt,
}: {
  cityName: string;
  citySlug?: string;
  current: CurrentWeather;
  today?: DailyPoint;
  hourly?: HourlyPoint[];
  geomagneticKp?: number;
  timezone?: string;
  fetchedAt?: string;
}) {
  const { unit, formatTemp } = useUnit();
  const slug = citySlug || "moscow";

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

  const windDirText = formatWindDir(current.windDirection);
  const pressureMm = formatPressureMmHg(current.pressure);
  const lastUpdatedText = formatTimeAgo(fetchedAt);

  return (
    <div className="space-y-3 max-w-4xl mx-auto">
      {/* Main Weather Card Container */}
      <section className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs text-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: City, Date, Main Temp & Details */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <Link
                href={`/pogoda/${slug}`}
                className="text-xl sm:text-2xl font-normal text-[#0077ff] hover:underline transition-colors"
              >
                {cityName}
              </Link>
              <LiveCityDate timezone={timezone} />
              {lastUpdatedText && (
                <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                  {lastUpdatedText}
                </div>
              )}
            </div>

            {/* Temperature badge + icon + condition text */}
            <div className="flex items-center gap-3">
              <span className="bg-[#edf4a1] px-3 py-1 rounded text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums min-w-[72px] text-center">
                {formatTemp(current.temperature)}
              </span>
              <WeatherIcon
                code={current.weatherCode}
                isDay={current.isDay}
                size={44}
                className="shrink-0"
              />
              <span className="text-xs sm:text-sm font-normal text-slate-700 leading-tight">
                {weatherCodeLabel(current.weatherCode)}
              </span>
            </div>

            {/* Detailed Stats List with Dotted Leaders */}
            <div className="space-y-1.5 pt-2 text-xs text-slate-700">
              <div className="flex items-baseline justify-between">
                <span className="shrink-0 text-slate-600">По ощущению</span>
                <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                <span className="shrink-0 font-medium tabular-nums text-slate-900">
                  {formatTemp(current.feelsLike)}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="shrink-0 text-slate-600">Ветер</span>
                <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                <span className="shrink-0 font-medium tabular-nums text-slate-900">
                  {Math.round(current.windSpeed)} м/с, {windDirText}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="shrink-0 text-slate-600">Давление</span>
                <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                <span className="shrink-0 font-medium tabular-nums text-slate-900">
                  {pressureMm}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="shrink-0 text-slate-600">Влажность</span>
                <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                <span className="shrink-0 font-medium tabular-nums text-slate-900">
                  {Math.round(current.humidity)} %
                </span>
              </div>

              {typeof current.waterTemperature === "number" && (
                <div className="flex items-baseline justify-between">
                  <span className="shrink-0 text-slate-600">Вода</span>
                  <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                  <span className="shrink-0 font-medium tabular-nums text-slate-900">
                    {formatTemp(current.waterTemperature)}
                  </span>
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <span className="shrink-0 text-slate-600">Г/м активность</span>
                <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                <span className="shrink-0 font-medium tabular-nums text-slate-900">
                  {geomagneticKp} балла
                </span>
              </div>
            </div>

            {/* Interactive Sun Arc Timeline Widget */}
            <SunArcTimeline
              sunrise={today?.sunrise}
              sunset={today?.sunset}
              timezone={timezone}
            />
          </div>

          {/* Right Column: 5-Hour Forecast Timeline */}
          {next5Hours.length > 0 && (
            <div className="md:col-span-7 md:border-l md:border-slate-200 md:pl-6 pt-4 md:pt-0">
              <div className="w-full">
                {/* Hourly Timeline Labels */}
                <div className="grid grid-cols-5 gap-1 text-center mb-2">
                  {next5Hours.map((h) => {
                    const label = new Date(h.time).toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <span key={h.time} className="text-xs font-normal text-slate-800 tabular-nums">
                        {label}
                      </span>
                    );
                  })}
                </div>

                {/* Hourly Weather Icons */}
                <div className="grid grid-cols-5 gap-1 text-center items-center justify-items-center mb-3">
                  {next5Hours.map((h) => (
                    <WeatherIcon
                      key={h.time}
                      code={h.weatherCode}
                      size={36}
                      className="shrink-0"
                    />
                  ))}
                </div>

                {/* Section Header: Air Temperature */}
                <p className="text-xs text-slate-600 mb-1.5 font-normal">
                  Температура воздуха, °{unit}
                </p>

                {/* Temperature Yellow Strip */}
                <div className="grid grid-cols-5 gap-1 bg-[#edf4a1] py-1.5 rounded text-center text-xs sm:text-sm font-semibold text-slate-900 mb-4 tabular-nums">
                  {next5Hours.map((h) => (
                    <span key={h.time}>{formatTemp(h.temperature)}</span>
                  ))}
                </div>

                {/* Section Header: Wind Gusts */}
                <p className="text-xs text-slate-600 mb-1.5 font-normal">Порывы ветра, м/с</p>

                {/* Wind Gusts Grey Pills */}
                <div className="grid grid-cols-5 gap-1 text-center">
                  {next5Hours.map((h) => {
                    const gust = Math.round(h.windGusts ?? h.windSpeed);
                    return (
                      <span
                        key={h.time}
                        className="bg-[#f0f2f5] rounded-full py-1 text-xs font-medium text-slate-800 tabular-nums shadow-2xs"
                      >
                        {gust}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function DayPartsGrid({
  hourly,
  date,
}: {
  hourly: HourlyPoint[];
  date: string;
}) {
  const { formatTemp } = useUnit();
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
  const { formatTemp } = useUnit();
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
  const { formatTemp } = useUnit();
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
  const { formatTemp } = useUnit();
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
