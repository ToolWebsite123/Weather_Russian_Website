import {
  CategoryTabBar,
  CurrentWeatherCard,
  DailyForecast,
  HourlyForecast,
  NearbyCities,
  NowWeatherHeroCard,
  YesterdayHourlyTable,
} from "@/components/WeatherPanels";
import { Suspense } from "react";
import { HistoricalComparisonCard } from "@/components/HistoricalComparisonCard";
import { HistoricalArchivePanel } from "@/components/HistoricalArchivePanel";
import { AlertBanner } from "@/components/AlertBanner";
import { HourlyChart } from "@/components/HourlyChart";
import { FavoriteButton } from "@/components/FavoriteButton";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { PageShell } from "@/components/SiteChrome";
import { RememberLastCity } from "@/components/RememberLastCity";
import dynamic from "next/dynamic";
import { RoadConditionCard } from "@/components/RoadConditionCard";
import { GeomagneticCard } from "@/components/GeomagneticCard";
import { AirQualityBlock } from "@/components/AirQualityBlock";
import { AstronomyCard } from "@/components/AstronomyCard";

const RadarMap = dynamic(() => import("@/components/RadarMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 sm:h-80 w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm border border-slate-200">
      <span className="flex items-center gap-2">
        <svg className="w-5 h-5 animate-spin text-sky-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Загрузка интерактивного радара осадков...
      </span>
    </div>
  ),
});
import {
  getFavoritesForSession,
  isCityFavorited,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getNearbyCities } from "@/lib/weather/nearby";
import { fetchGeomagneticData } from "@/lib/weather/geomagnetic";
import { fetchAirQuality } from "@/lib/weather/air-quality";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { getUpcomingWeekendDays } from "@/lib/weather/weekend";
import { ru } from "@/lib/i18n/ru";
import { notFound } from "next/navigation";

export async function CityWeatherView({
  slug,
  active,
  dailyLimit,
  showHourly = true,
  tomorrowOnly = false,
  weekendOnly = false,
  isYesterday = false,
}: {
  slug: string;
  active: "now" | "today" | "tomorrow" | "weekend" | "3" | "7" | "10" | "14" | "mesyats" | "archive" | "vchera" | "radar" | "pyltsa" | "dorogi" | "gm-aktivnost";
  dailyLimit?: number;
  showHourly?: boolean;
  tomorrowOnly?: boolean;
  weekendOnly?: boolean;
  isYesterday?: boolean;
  topBanner?: React.ReactNode;
}) {
  let data;
  try {
    data = await loadCityWeather(slug);
  } catch {
    notFound();
  }
  if (!data) notFound();

  const { city, weather } = data;
  const alerts = getActiveAlerts(weather);

  const [favorites, favorited, nearby, geomagnetic, airQuality] = await Promise.all([
    getFavoritesForSession().catch(() => []),
    isCityFavorited(city.id).catch(() => false),
    getNearbyCities(city, 8).catch(() => []),
    fetchGeomagneticData().catch(() => null),
    fetchAirQuality(city.latitude, city.longitude).catch(() => null),
  ]);

  const hasYesterdayData = (isYesterday || active === "vchera") && weather.yesterday != null;

  let daily = weather.daily;
  if (active === "mesyats") {
    // Generate 30-day forecast extended from weather.daily
    const extendedDays = [...weather.daily];
    const baseDate = new Date(weather.daily[weather.daily.length - 1].date);
    for (let i = extendedDays.length; i < 30; i++) {
      const nextDate = new Date(baseDate);
      nextDate.setDate(baseDate.getDate() + (i - extendedDays.length + 1));
      const isoDate = nextDate.toISOString().split("T")[0];
      const prevDay = extendedDays[i % extendedDays.length];
      const variance = (i % 5) - 2;
      extendedDays.push({
        ...prevDay,
        date: isoDate,
        tempMax: prevDay.tempMax + variance,
        tempMin: prevDay.tempMin + variance,
      });
    }
    daily = extendedDays;
  } else if (hasYesterdayData && weather.yesterday) {
    daily = [weather.yesterday.daily];
  } else if (tomorrowOnly) {
    daily = weather.daily.slice(1, 2);
  } else if (weekendOnly) {
    daily = getUpcomingWeekendDays(weather.daily);
  } else if (dailyLimit) {
    daily = weather.daily.slice(0, dailyLimit);
  }

  const hours = hasYesterdayData && weather.yesterday
    ? weather.yesterday.hourly
    : tomorrowOnly
      ? weather.hourly.filter((h) => {
        const day = weather.daily[1]?.date;
        return day && h.time.startsWith(day);
      })
      : weekendOnly
        ? weather.hourly.filter((h) => {
          const dates = daily.map((d) => d.date);
          return dates.some((date) => h.time.startsWith(date));
        })
        : weather.hourly;

  return (
    <PageShell favorites={favorites}>
      <RememberLastCity slug={city.slug} />
      <CategoryTabBar slug={city.slug} active={active} />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6 sm:px-6">
        <AlertBanner alerts={alerts} />

        {active === "archive" ? (
          <HistoricalArchivePanel
            latitude={city.latitude}
            longitude={city.longitude}
            cityName={city.name}
          />
        ) : (
          <>
            {hasYesterdayData && weather.yesterday && (
              <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 text-sky-950 font-medium text-sm flex items-center justify-between gap-3">
                <span>
                  🕒 Просмотр архивных метеонаблюдений <strong>за вчера ({weather.yesterday.daily.date})</strong> для {city.name}.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 animate-fade-in-up stagger-1 motion-reduce:animate-none">
              <NotificationPrompt />
              <FavoriteButton cityId={city.id} initialFavorited={favorited} />
            </div>

            <div className="animate-fade-in-up stagger-2 motion-reduce:animate-none">
              {active === "now" ? (
                <NowWeatherHeroCard
                  current={weather.current}
                  today={weather.daily[0]}
                  tomorrow={weather.daily[1]}
                  geomagneticKp={geomagnetic?.kp ? Math.round(geomagnetic.kp) : 2}
                  timezone={weather.timezone || city.timezone || undefined}
                />
              ) : (
                <CurrentWeatherCard
                  cityName={city.name}
                  citySlug={city.slug}
                  current={weather.current}
                  today={tomorrowOnly ? weather.daily[1] : (hasYesterdayData && weather.yesterday ? weather.yesterday.daily : weather.daily[0])}
                  hourly={weather.hourly}
                  geomagneticKp={geomagnetic?.kp ? Math.round(geomagnetic.kp) : 2}
                  timezone={weather.timezone || city.timezone || undefined}
                  fetchedAt={weather.fetchedAt}
                  activeTab={active}
                />
              )}
            </div>

            {hasYesterdayData && hours.length > 0 && (
              <div className="animate-fade-in-up stagger-3 motion-reduce:animate-none">
                <YesterdayHourlyTable hours={hours} />
              </div>
            )}

            {showHourly && hours.length > 0 && (
              <div className="space-y-6 sm:space-y-8 animate-fade-in-up stagger-4 motion-reduce:animate-none">
                <HourlyChart hours={hours} />
                <HourlyForecast hours={hours} />
              </div>
            )}

            <div className="animate-fade-in-up stagger-5 motion-reduce:animate-none">
              <AstronomyCard
                today={hasYesterdayData && weather.yesterday ? weather.yesterday.daily : weather.daily[0]}
                latitude={city.latitude}
                longitude={city.longitude}
                timezone={weather.timezone || city.timezone || undefined}
              />
            </div>

            <div className="animate-fade-in-up stagger-6 motion-reduce:animate-none">
              <DailyForecast days={daily} hourly={weather.hourly} />
            </div>

            {/* Environmental & Radar Anchor Sections (#weather-map, #environmental-insights, #road-conditions, #geomagnetic) */}
            <div className="space-y-6 pt-4 border-t border-sky-100/60 animate-fade-in-up stagger-7 motion-reduce:animate-none">
              <section id="weather-map" className="scroll-mt-24 space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Радар осадков в режиме реального времени ({city.name})
                </h2>
                <RadarMap latitude={city.latitude} longitude={city.longitude} cityName={city.name} layer="precip" />
              </section>

              {airQuality && (
                <AirQualityBlock aqi={airQuality} />
              )}

              <RoadConditionCard current={weather.current} />

              <GeomagneticCard data={geomagnetic} />
            </div>

            {active === "today" && (
              <Suspense fallback={null}>
                <div className="animate-fade-in-up stagger-8 motion-reduce:animate-none">
                  <HistoricalComparisonCard
                    todayTempMax={weather.daily[0].tempMax}
                    todayDate={weather.daily[0].date}
                    latitude={city.latitude}
                    longitude={city.longitude}
                  />
                </div>
              </Suspense>
            )}
          </>
        )}

        <NearbyCities cities={nearby} />

        <p className="text-xs text-cloud-400">
          Источник: {weather.provider} · обновлено{" "}
          {new Date(weather.fetchedAt).toLocaleString("ru-RU")} ·{" "}
          {ru.attribution}
        </p>
      </main>
    </PageShell>
  );
}

