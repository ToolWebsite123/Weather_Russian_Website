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
import { PressureTooltip } from "@/components/PressureTooltip";

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

  const getMinutesInTz = (d: Date) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: timezone || "Europe/Moscow",
    }).formatToParts(d);
    let h = 0;
    let m = 0;
    for (const p of parts) {
      if (p.type === "hour") h = parseInt(p.value, 10);
      if (p.type === "minute") m = parseInt(p.value, 10);
    }
    return h * 60 + m;
  };

  const nowMins = getMinutesInTz(new Date());
  const srMins = sunrise ? getMinutesInTz(new Date(sunrise)) : 330;
  const ssMins = sunset ? getMinutesInTz(new Date(sunset)) : 1140;

  const isDay = nowMins >= srMins && nowMins <= ssMins;

  let progress = 0.5;
  if (isDay && ssMins > srMins) {
    progress = Math.max(0, Math.min(1, (nowMins - srMins) / (ssMins - srMins)));
  } else if (!isDay) {
    const nightDuration = (1440 - ssMins) + srMins;
    const elapsedNight = nowMins > ssMins ? nowMins - ssMins : (1440 - ssMins) + nowMins;
    progress = Math.max(0, Math.min(1, elapsedNight / (nightDuration || 1)));
  }

  const x = 15 + 170 * progress;
  const y = 50 - 90 * progress * (1 - progress);

  return (
    <div className="rounded-xl bg-gradient-to-b from-sky-50/80 to-amber-50/50 p-3 ring-1 ring-sky-100/70 mt-3 text-xs" suppressHydrationWarning>
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
            <g transform={`translate(${x}, ${y})`}>
              <path
                d="M -3 -6 A 6 6 0 1 0 6 3 A 4.5 4.5 0 1 1 -3 -6 Z"
                fill="#0284c7"
                stroke="#0369a1"
                strokeWidth="1.5"
              />
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
    { id: "now", href: `/pogoda/${slug}/now`, label: "Сейчас" },
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

  const featureTabs = [
    {
      id: "radar",
      href: `/pogoda/${slug}/radar`,
      label: "Радар",
      icon: (
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
      ),
    },
    {
      id: "pyltsa",
      href: `/pogoda/${slug}/pyltsa`,
      label: "Пыльца",
      icon: (
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
      ),
    },
    {
      id: "dorogi",
      href: `/pogoda/${slug}/dorogi`,
      label: "Дороги",
      icon: (
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
      ),
    },
    {
      id: "gm-aktivnost",
      href: `/pogoda/${slug}/gm-aktivnost`,
      label: "Г/м активность",
      icon: (
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
      ),
    },
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
                prefetch={true}
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

          {featureTabs.map((ft) => {
            const isActive = ft.id === activeNormalized;
            return (
              <Link
                key={ft.id}
                href={ft.href}
                prefetch={true}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm transition-colors align-middle shrink-0 ${
                  isActive
                    ? "bg-white text-[#0f3d3a] font-semibold shadow-xs"
                    : "text-[#bcd8d4] hover:bg-white/10"
                }`}
              >
                {ft.icon}
                <span>{ft.label}</span>
              </Link>
            );
          })}
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
  activeTab,
}: {
  cityName: string;
  citySlug?: string;
  current: CurrentWeather;
  today?: DailyPoint;
  hourly?: HourlyPoint[];
  geomagneticKp?: number;
  timezone?: string;
  fetchedAt?: string;
  activeTab?: string;
}) {
  const { unit, formatTemp } = useUnit();
  const slug = citySlug || "moscow";

  const periodBadge = (() => {
    if (!activeTab || activeTab === "today" || activeTab === "now") return null;
    const labels: Record<string, { label: string; bg: string }> = {
      tomorrow: { label: "Прогноз на завтра", bg: "bg-sky-100 text-sky-800 border-sky-200" },
      zavtra: { label: "Прогноз на завтра", bg: "bg-sky-100 text-sky-800 border-sky-200" },
      vchera: { label: "Архив за вчера", bg: "bg-amber-100 text-amber-800 border-amber-200" },
      "3": { label: "Прогноз на 3 дня", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      "3-dnya": { label: "Прогноз на 3 дня", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      "7": { label: "Прогноз на 7 дней", bg: "bg-teal-100 text-teal-800 border-teal-200" },
      "7-dney": { label: "Прогноз на 7 дней", bg: "bg-teal-100 text-teal-800 border-teal-200" },
      "10": { label: "Прогноз на 10 дней", bg: "bg-blue-100 text-blue-800 border-blue-200" },
      "10-dney": { label: "Прогноз на 10 дней", bg: "bg-blue-100 text-blue-800 border-blue-200" },
      "14": { label: "Прогноз на 14 дней", bg: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      "14-dney": { label: "Прогноз на 14 дней", bg: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      mesyats: { label: "Прогноз на месяц", bg: "bg-purple-100 text-purple-800 border-purple-200" },
      weekend: { label: "Прогноз на выходные", bg: "bg-rose-100 text-rose-800 border-rose-200" },
      vykhodnye: { label: "Прогноз на выходные", bg: "bg-rose-100 text-rose-800 border-rose-200" },
    };
    const b = labels[activeTab];
    if (!b) return null;
    return (
      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${b.bg} ml-2 align-middle`}>
        {b.label}
      </span>
    );
  })();

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
              {periodBadge}
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
                <span className="shrink-0 text-slate-600 flex items-center">
                  Давление
                  <PressureTooltip />
                </span>
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
                <div
                  className="flex items-baseline justify-between"
                  title={
                    current.waterTemperatureSource === "estimated"
                      ? "Оценочное значение на основе температуры воздуха за последние 10 дней"
                      : undefined
                  }
                >
                  <span className="shrink-0 text-slate-600">Вода</span>
                  <span className="flex-1 mx-1 border-b border-dotted border-slate-300 relative top-[-3px]" />
                  <span className="shrink-0 font-medium tabular-nums text-slate-900">
                    {current.waterTemperatureSource === "estimated" ? "≈" : ""}
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
                      timeZone: timezone || "Europe/Moscow",
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

export function NowWeatherHeroCard({
  current,
  today,
  tomorrow,
  geomagneticKp = 2,
  timezone,
}: {
  cityName?: string;
  citySlug?: string;
  current: CurrentWeather;
  today?: DailyPoint;
  tomorrow?: DailyPoint;
  geomagneticKp?: number;
  timezone?: string;
  fetchedAt?: string;
}) {
  const { formatTemp } = useUnit();

  const windDirText = formatWindDir(current.windDirection);
  const pressureMm = formatPressureMmHg(current.pressure);

  const sunriseStr = today?.sunrise
    ? new Date(today.sunrise).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || "Europe/Moscow",
      })
    : "04:49";

  const sunsetStr = today?.sunset
    ? new Date(today.sunset).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: timezone || "Europe/Moscow",
      })
    : "20:19";

  const now = new Date();

  // Calculate sun arc progress (0..1) based on target city local timezone minutes from midnight
  let sunProgress = 0.5;
  let isDayCalculated = true;
  try {
    const tz = timezone || "Europe/Moscow";
    const getMinutesFromMidnight = (dateObj: Date) => {
      const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
        timeZone: tz,
      }).formatToParts(dateObj);
      let h = 0;
      let m = 0;
      for (const p of parts) {
        if (p.type === "hour") h = parseInt(p.value, 10);
        if (p.type === "minute") m = parseInt(p.value, 10);
      }
      return h * 60 + m;
    };

    const nowMins = getMinutesFromMidnight(new Date());
    const srMins = today?.sunrise ? getMinutesFromMidnight(new Date(today.sunrise)) : 330;
    const ssMins = today?.sunset ? getMinutesFromMidnight(new Date(today.sunset)) : 1140;

    isDayCalculated = nowMins >= srMins && nowMins <= ssMins;

    if (isDayCalculated && ssMins > srMins) {
      const totalMins = ssMins - srMins;
      const elapsedMins = nowMins - srMins;
      sunProgress = Math.max(0, Math.min(1, elapsedMins / totalMins));
    } else if (!isDayCalculated) {
      const nightDuration = (1440 - ssMins) + srMins;
      const elapsedNight = nowMins > ssMins ? nowMins - ssMins : (1440 - ssMins) + nowMins;
      sunProgress = Math.max(0, Math.min(1, elapsedNight / (nightDuration || 1)));
    }
  } catch {
    sunProgress = 0.5;
  }

  // Bezier curve calculations for SVG trajectory: P0=(30,65), P1=(150,15), P2=(270,65)
  const t = sunProgress;
  const sunX = (1 - t) * (1 - t) * 30 + 2 * (1 - t) * t * 150 + t * t * 270;
  const sunY = (1 - t) * (1 - t) * 65 + 2 * (1 - t) * t * 15 + t * t * 65;

  const isDay = typeof current.isDay === "boolean" ? current.isDay : isDayCalculated;

  // Calculate daylight duration
  let daylightStr = "";
  const srDate = today?.sunrise ? new Date(today.sunrise) : null;
  const ssDate = today?.sunset ? new Date(today.sunset) : null;
  if (srDate && ssDate) {
    const durationMs = ssDate.getTime() - srDate.getTime();
    if (durationMs > 0) {
      const totalMinutes = Math.floor(durationMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      daylightStr = `Долгота дня: ${hours} ч ${minutes} мин`;
    }
  }

  const weatherCode = current.weatherCode;
  const isThunderstorm = [95, 96, 99].includes(weatherCode);
  const isHeavyRain = [55, 57, 63, 65, 67, 81, 82].includes(weatherCode);
  const isRain = [51, 53, 56, 61, 66, 80].includes(weatherCode) || isHeavyRain;
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isFog = [45, 48].includes(weatherCode);
  const isCloudy = [2, 3].includes(weatherCode);

  let bgGradient = isDay
    ? "bg-gradient-to-b from-[#2a80d8] via-[#3fa1f7] to-[#5bb2ff]"
    : "bg-gradient-to-b from-[#0b132b] via-[#1c2541] to-[#3a506b]";

  if (isThunderstorm) {
    bgGradient = isDay
      ? "bg-gradient-to-b from-[#253654] via-[#354f7a] to-[#4b6c9b]"
      : "bg-gradient-to-b from-[#120d29] via-[#1f163d] to-[#302359]";
  } else if (isHeavyRain) {
    bgGradient = isDay
      ? "bg-gradient-to-b from-[#1e304b] via-[#2b4467] to-[#3d5a80]"
      : "bg-gradient-to-b from-[#0a101d] via-[#151d2d] to-[#212d40]";
  } else if (isRain) {
    bgGradient = isDay
      ? "bg-gradient-to-b from-[#2b4c7e] via-[#3a629b] to-[#4e7da6]"
      : "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#2b384e]";
  } else if (isSnow) {
    bgGradient = isDay
      ? "bg-gradient-to-b from-[#3a5a80] via-[#5b7ea6] to-[#7f9ec2]"
      : "bg-gradient-to-b from-[#121c2b] via-[#1f2d42] to-[#2d3e58]";
  } else if (isFog) {
    bgGradient = "bg-gradient-to-b from-[#374151] via-[#4b5563] to-[#6b7280]";
  } else if (isCloudy) {
    bgGradient = isDay
      ? "bg-gradient-to-b from-[#2c435e] via-[#3b597a] to-[#4c7097]"
      : "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]";
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top 3 Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Сейчас */}
        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1" suppressHydrationWarning>
              Сейчас {now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: timezone || "Europe/Moscow" })}
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-[#edf4a1] px-2.5 py-0.5 rounded text-lg font-bold text-slate-900 tabular-nums">
                {formatTemp(current.temperature)}
              </span>
              <span className="text-xs text-slate-600">
                По ощущению {formatTemp(current.feelsLike)}
              </span>
            </div>
          </div>
          <WeatherIcon code={current.weatherCode} isDay={current.isDay} size={36} className="shrink-0" />
        </div>

        {/* Card 2: Сегодня */}
        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">Сегодня</div>
            {today ? (
              <div className="flex items-center gap-1.5">
                <span className="bg-[#edf4a1] px-2 py-0.5 rounded text-sm font-semibold text-slate-900 tabular-nums">
                  {formatTemp(today.tempMin)}
                </span>
                <span className="text-xs text-slate-400">...</span>
                <span className="bg-[#edf4a1] px-2 py-0.5 rounded text-sm font-semibold text-slate-900 tabular-nums">
                  {formatTemp(today.tempMax)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>
          {today && <WeatherIcon code={today.weatherCode} size={36} className="shrink-0" />}
        </div>

        {/* Card 3: Завтра */}
        <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">Завтра</div>
            {tomorrow ? (
              <div className="flex items-center gap-1.5">
                <span className="bg-[#edf4a1] px-2 py-0.5 rounded text-sm font-semibold text-slate-900 tabular-nums">
                  {formatTemp(tomorrow.tempMin)}
                </span>
                <span className="text-xs text-slate-400">...</span>
                <span className="bg-[#edf4a1] px-2 py-0.5 rounded text-sm font-semibold text-slate-900 tabular-nums">
                  {formatTemp(tomorrow.tempMax)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}
          </div>
          {tomorrow && <WeatherIcon code={tomorrow.weatherCode} size={36} className="shrink-0" />}
        </div>
      </div>

      {/* Main Sky Hero Card Container */}
      <section
        className={`relative overflow-hidden rounded-2xl shadow-lg border border-sky-300/30 text-white ${bgGradient}`}
      >
        {/* Animated Rain Scene Overlay (falling raindrops) */}
        {isRain && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 25 }).map((_, i) => {
              const left = (i * 4.1 + (i % 3) * 7) % 96;
              const delay = ((i * 0.17) % 2.2).toFixed(2);
              const duration = (0.75 + ((i % 5) * 0.15)).toFixed(2);
              const height = i % 2 === 0 ? "h-5" : "h-3.5";
              return (
                <div
                  key={`rain-${i}`}
                  className={`absolute top-0 w-[1.5px] ${height} bg-white/40 rounded-full animate-raindrop`}
                  style={{
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Animated Snow Scene Overlay */}
        {isSnow && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: 20 }).map((_, i) => {
              const left = (i * 5.1 + (i % 4) * 6) % 96;
              const delay = ((i * 0.23) % 3.1).toFixed(2);
              const duration = (2.2 + ((i % 4) * 0.4)).toFixed(2);
              const size = i % 2 === 0 ? "w-2 h-2" : "w-1.5 h-1.5";
              return (
                <div
                  key={`snow-${i}`}
                  className={`absolute top-0 ${size} bg-white/80 rounded-full blur-[0.5px] animate-snowflake`}
                  style={{
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Ambient Lightning Flash for Thunderstorms */}
        {isThunderstorm && (
          <div className="absolute inset-0 pointer-events-none bg-white/30 animate-lightning z-0" />
        )}

        {/* Soft Radial Sky Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent z-0" />

        <div className="relative z-10 pt-6 pb-4 px-4 sm:px-8 text-center space-y-4">
          {/* Header Live Time */}
          <div className="text-sm sm:text-base font-medium text-white/90 drop-shadow-xs">
            <LiveCityDate timezone={timezone} />
          </div>

          {/* Sun / Moon Arc Diagram */}
          <div className="relative mx-auto w-full max-w-[320px] h-24 my-2">
            <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
              {/* Arc curve */}
              <path
                d="M 30 65 Q 150 15 270 65"
                fill="none"
                stroke="rgba(255, 255, 255, 0.45)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Sun / Moon position marker */}
              {isDay ? (
                <g>
                  <circle cx={sunX} cy={sunY} r="7" fill={isRain || isCloudy ? "#cbd5e1" : "#fcf003"} filter="drop-shadow(0px 0px 6px #fcf003)" />
                  <circle cx={sunX} cy={sunY} r="3" fill="#ffffff" />
                </g>
              ) : (
                <g transform={`translate(${sunX}, ${sunY})`}>
                  <path
                    d="M -4 -7 A 7 7 0 1 0 7 4 A 5.5 5.5 0 1 1 -4 -7 Z"
                    fill="#f8fafc"
                    filter="drop-shadow(0px 0px 8px #38bdf8)"
                  />
                </g>
              )}

              {/* Daylight duration center badge */}
              {daylightStr && (
                <text x="150" y="45" fill="rgba(255,255,255,0.85)" fontSize="9" textAnchor="middle" fontWeight="500">
                  {daylightStr}
                </text>
              )}

              {/* Sunrise label (left) */}
              <text x="25" y="78" fill="rgba(255,255,255,0.9)" fontSize="10" textAnchor="middle" fontWeight="500">
                {sunriseStr}
              </text>
              <text x="25" y="90" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">
                Восход
              </text>

              {/* Sunset label (right) */}
              <text x="275" y="78" fill="rgba(255,255,255,0.9)" fontSize="10" textAnchor="middle" fontWeight="500">
                {sunsetStr}
              </text>
              <text x="275" y="90" fill="rgba(255,255,255,0.7)" fontSize="9" textAnchor="middle">
                Заход
              </text>
            </svg>
          </div>

          {/* Main GIANT Temperature */}
          <div className="space-y-2 py-2">
            <div className="text-6xl sm:text-8xl font-bold tracking-tight text-white drop-shadow-md tabular-nums">
              {formatTemp(current.temperature)}
            </div>

            {/* Feels-Like Translucent Pill */}
            <div className="inline-block">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white shadow-xs border border-white/25">
                По ощущению {formatTemp(current.feelsLike)}
              </span>
            </div>

            {/* Condition Icon + Condition Label */}
            <div className="flex items-center justify-center gap-2.5 text-base sm:text-xl font-medium text-white drop-shadow-xs pt-1">
              <WeatherIcon
                code={current.weatherCode}
                isDay={current.isDay}
                size={38}
                className="shrink-0 drop-shadow-md"
              />
              <span>{weatherCodeLabel(current.weatherCode)}</span>
            </div>
          </div>
        </div>

        {/* Bottom 5-Stat Frosted Glass Bar */}
        <div className="bg-black/20 backdrop-blur-md border-t border-white/20 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-white">
            {/* Stat 1: Ветер */}
            <div className="space-y-1">
              <div className="text-[11px] text-white/70 font-normal">Ветер</div>
              <div className="text-sm sm:text-base font-semibold tabular-nums">
                {Math.round(current.windSpeed)} <span className="text-xs font-normal">м/с {windDirText}</span>
              </div>
            </div>

            {/* Stat 2: Давление */}
            <div className="space-y-1 sm:border-l sm:border-white/20 sm:pl-2">
              <div className="text-[11px] text-white/70 font-normal">Давление</div>
              <div className="text-sm sm:text-base font-semibold tabular-nums">
                {pressureMm}
              </div>
            </div>

            {/* Stat 3: Влажность */}
            <div className="space-y-1 sm:border-l sm:border-white/20 sm:pl-2">
              <div className="text-[11px] text-white/70 font-normal">Влажность</div>
              <div className="text-sm sm:text-base font-semibold tabular-nums">
                {Math.round(current.humidity)} <span className="text-xs font-normal">%</span>
              </div>
            </div>

            {/* Stat 4: Г/м */}
            <div className="space-y-1 sm:border-l sm:border-white/20 sm:pl-2">
              <div className="text-[11px] text-white/70 font-normal">Г/м</div>
              <div className="text-sm sm:text-base font-semibold tabular-nums">
                {geomagneticKp} <span className="text-xs font-normal">балла из 9</span>
              </div>
            </div>

            {/* Stat 5: Вода */}
            <div className="space-y-1 sm:border-l sm:border-white/20 sm:pl-2 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-white/70 font-normal">Вода</div>
              <div className="text-sm sm:text-base font-semibold tabular-nums">
                {typeof current.waterTemperature === "number"
                  ? formatTemp(current.waterTemperature)
                  : "—"}
              </div>
            </div>
          </div>
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
          <PressureTooltip />
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
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-h2 text-sky-950">{ru.daily}</h2>
        <span className="text-xs text-cloud-500 font-medium hidden sm:inline-block">
          Мин / Макс температура · Осадки · Ветер
        </span>
      </div>
      <ul className="divide-y divide-sky-100 overflow-hidden rounded-2xl bg-white/95 border border-sky-200/80 shadow-xs ring-1 ring-sky-100/50">
        {list.map((d) => {
          const dateObj = new Date(d.date + "T12:00:00");
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const dateLabel = dateObj.toLocaleDateString(
            "ru-RU",
            { weekday: "short", day: "numeric", month: "short" },
          );
          const parts = hourly ? summarizeDayParts(hourly, d.date) : [];
          const leftPercent = ((d.tempMin - globalMin) / range) * 100;
          const widthPercent = Math.max(6, ((d.tempMax - d.tempMin) / range) * 100);

          return (
            <li key={d.date} className="px-3 py-3 sm:px-5 hover:bg-sky-50/40 transition-colors">
              <div className="flex items-center gap-2 text-sm sm:gap-4 sm:text-base">
                <span className={`w-24 capitalize font-semibold sm:w-32 shrink-0 truncate ${
                  isWeekend ? "text-rose-600" : "text-sky-950"
                }`}>
                  {dateLabel}
                </span>
                <WeatherIcon code={d.weatherCode} size={30} className="shrink-0" />
                <span className="hidden flex-1 text-cloud-600 md:block truncate text-xs sm:text-sm">
                  {weatherCodeLabel(d.weatherCode)}
                </span>

                {/* Min/Max Temperature Visual Bar */}
                <div className="hidden sm:flex flex-1 items-center mx-2 max-w-[160px]">
                  <div className="h-2 w-full rounded-full bg-slate-100 relative overflow-hidden ring-1 ring-slate-200/60">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-amber-500"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Night / Day Temperatures */}
                <div className="ml-auto flex items-center gap-1.5 tabular-nums shrink-0">
                  <span className="text-cloud-500 text-xs sm:text-sm font-normal">
                    {formatTemp(d.tempMin)}
                  </span>
                  <span className="text-cloud-300 text-xs font-light">/</span>
                  <span className="text-sky-950 text-sm sm:text-base font-bold">
                    {formatTemp(d.tempMax)}
                  </span>
                </div>

                {/* Wind Max */}
                {typeof d.windSpeedMax === "number" && (
                  <span className="hidden md:flex items-center gap-1 w-20 justify-end text-xs text-slate-600 shrink-0 font-medium tabular-nums" title="Максимальная скорость ветра">
                    <svg className="w-3 h-3 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
                    {Math.round(d.windSpeedMax)} м/с
                  </span>
                )}

                {/* Precipitation Sum */}
                <span className={`w-14 text-right tabular-nums text-xs sm:text-sm font-medium shrink-0 ${
                  d.precipitationSum > 0 ? "text-sky-700 font-bold" : "text-cloud-400"
                }`}>
                  {d.precipitationSum > 0 ? `${d.precipitationSum.toFixed(1)} мм` : "0 мм"}
                </span>
              </div>

              {/* Mobile range bar row */}
              <div className="mt-1.5 sm:hidden flex items-center px-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100 relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>
              </div>

              {parts.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-1 sm:hidden">
                  {parts.map((p) => (
                    <div
                      key={p.key}
                      className="rounded-lg bg-sky-50/80 px-1 py-1 text-center border border-sky-100/60"
                    >
                      <p className="text-[9px] text-cloud-500 font-medium">{p.label}</p>
                      <p className="text-xs font-semibold tabular-nums text-sky-950">
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
    <section className="rounded-2xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-sm backdrop-blur sm:p-5">
      <h2 className="mb-3 font-serif text-h2 font-semibold text-sky-950 flex items-center gap-1.5">
        <span>📍</span>
        <span>Ближайшие города и пригороды</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {cities.map((c) => (
          <Link
            key={c.slug}
            href={`/pogoda/${c.slug}`}
            className="inline-flex items-center gap-1 rounded-xl bg-sky-50/80 px-3 py-1.5 text-xs font-semibold text-sky-900 ring-1 ring-sky-200/70 transition-all hover:bg-sky-500 hover:text-white active:scale-95 shadow-sm"
          >
            <span>{c.name}</span>
            <span className="text-[10px] opacity-70">→</span>
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

export function YesterdayHourlyTable({
  hours,
  timezone,
}: {
  hours: HourlyPoint[];
  timezone?: string;
}) {
  const { formatTemp } = useUnit();

  // Show 3-hour interval points for structured table display (or all if <= 8 points)
  const displayHours =
    hours.length > 8 ? hours.filter((_, idx) => idx % 3 === 0) : hours;

  if (displayHours.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-h2 text-sky-950">
          Почасовой архив метеонаблюдений за вчера
        </h2>
        <span className="text-xs text-cloud-500 font-medium hidden sm:inline-block">
          Интервал: 3 часа · Метеоданные
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sky-200/80 bg-white/95 shadow-xs ring-1 ring-sky-100/50">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-sky-100 bg-sky-50/70 text-cloud-600 font-semibold">
              <th className="px-3 py-2.5 sm:px-4">Время</th>
              <th className="px-3 py-2.5 sm:px-4">Погода</th>
              <th className="px-3 py-2.5 sm:px-4 text-right">Темп.</th>
              <th className="px-3 py-2.5 sm:px-4 text-right">Ощущается</th>
              <th className="px-3 py-2.5 sm:px-4">Ветер</th>
              <th className="px-3 py-2.5 sm:px-4 text-right">
                <span className="inline-flex items-center gap-0.5 justify-end">
                  Давление
                  <PressureTooltip />
                </span>
              </th>
              <th className="px-3 py-2.5 sm:px-4 text-right">Влажность</th>
              <th className="px-3 py-2.5 sm:px-4 text-right">Осадки</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100/80">
            {displayHours.map((h) => {
              const timeLabel = new Date(h.time).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: timezone || "Europe/Moscow",
              });

              const windDirStr =
                typeof h.windDirection === "number"
                  ? formatWindDir(h.windDirection)
                  : "";
              const windSpeedStr = `${Math.round(h.windSpeed)} м/с${
                windDirStr ? ` ${windDirStr}` : ""
              }`;
              const windGustsStr =
                h.windGusts && h.windGusts > h.windSpeed + 1
                  ? ` (порывы ${Math.round(h.windGusts)})`
                  : "";

              const pressureStr =
                typeof h.pressure === "number"
                  ? formatPressureMmHg(h.pressure)
                  : "—";
              const humidityStr =
                typeof h.humidity === "number"
                  ? `${Math.round(h.humidity)}%`
                  : "—";

              return (
                <tr key={h.time} className="hover:bg-sky-50/40 transition-colors">
                  <td className="px-3 py-3 sm:px-4 font-semibold text-sky-950 tabular-nums whitespace-nowrap">
                    {timeLabel}
                  </td>
                  <td className="px-3 py-3 sm:px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <WeatherIcon code={h.weatherCode} size={28} className="shrink-0" />
                      <span className="text-xs text-slate-700 hidden md:inline">
                        {weatherCodeLabel(h.weatherCode)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-right font-bold text-sky-950 tabular-nums whitespace-nowrap">
                    {formatTemp(h.temperature)}
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-right text-cloud-600 tabular-nums whitespace-nowrap">
                    {typeof h.feelsLike === "number"
                      ? formatTemp(h.feelsLike)
                      : "—"}
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-slate-800 text-xs tabular-nums whitespace-nowrap">
                    <span>{windSpeedStr}</span>
                    {windGustsStr && (
                      <span className="text-cloud-400 text-[11px]">
                        {windGustsStr}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-right text-slate-800 tabular-nums whitespace-nowrap">
                    {pressureStr}
                  </td>
                  <td className="px-3 py-3 sm:px-4 text-right text-slate-800 tabular-nums whitespace-nowrap">
                    {humidityStr}
                  </td>
                  <td
                    className={`px-3 py-3 sm:px-4 text-right tabular-nums whitespace-nowrap font-medium ${
                      h.precipitation > 0 ? "text-sky-700 font-bold" : "text-cloud-400"
                    }`}
                  >
                    {h.precipitation > 0 ? `${h.precipitation.toFixed(1)} мм` : "0 мм"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
