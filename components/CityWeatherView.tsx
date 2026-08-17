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
import { AutoScrollTarget } from "@/components/AutoScrollTarget";
import { CountryRelatedCities } from "@/components/CountryRelatedCities";

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
import { formatDateTimeRu } from "@/lib/cities";
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
  active:
    | "now"
    | "today"
    | "tomorrow"
    | "zavtra"
    | "weekend"
    | "vykhodnye"
    | "3"
    | "3-dnya"
    | "7"
    | "7-dney"
    | "10"
    | "10-dney"
    | "14"
    | "14-dney"
    | "mesyats"
    | "archive"
    | "vchera"
    | "radar"
    | "pyltsa"
    | "dorogi"
    | "gm-aktivnost";
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

  // Performance optimization: conditionally fetch geomagnetic / air quality only if active tab uses them
  const needsGeomagnetic = active === "now" || active === "today" || active === "gm-aktivnost";
  const needsAirQuality = active === "now" || active === "today" || active === "pyltsa";

  const [favorites, favorited, nearby, geomagnetic, airQuality] = await Promise.all([
    getFavoritesForSession().catch(() => []),
    isCityFavorited(city.id).catch(() => false),
    getNearbyCities(city, 8).catch(() => []),
    needsGeomagnetic ? fetchGeomagneticData().catch(() => null) : Promise.resolve(null),
    needsAirQuality ? fetchAirQuality(city.latitude, city.longitude).catch(() => null) : Promise.resolve(null),
  ]);

  const hasYesterdayData = (isYesterday || active === "vchera") && weather.yesterday != null;

  let daily = weather.daily;
  if (hasYesterdayData && weather.yesterday) {
    daily = [weather.yesterday.daily];
  } else if (tomorrowOnly || active === "tomorrow" || active === "zavtra") {
    daily = weather.daily.slice(1, 2);
  } else if (weekendOnly || active === "weekend" || active === "vykhodnye") {
    daily = getUpcomingWeekendDays(weather.daily);
  } else if (active === "3" || active === "3-dnya") {
    daily = weather.daily.slice(0, 3);
  } else if (active === "7" || active === "7-dney") {
    daily = weather.daily.slice(0, 7);
  } else if (active === "10" || active === "10-dney") {
    daily = weather.daily.slice(0, 10);
  } else if (active === "14" || active === "14-dney" || active === "mesyats") {
    daily = weather.daily.slice(0, 14);
  } else if (dailyLimit) {
    daily = weather.daily.slice(0, dailyLimit);
  }

  const hours = hasYesterdayData && weather.yesterday
    ? weather.yesterday.hourly
    : (tomorrowOnly || active === "tomorrow" || active === "zavtra")
      ? weather.hourly.filter((h) => {
        const day = weather.daily[1]?.date;
        return day && h.time.startsWith(day);
      })
      : (weekendOnly || active === "weekend" || active === "vykhodnye")
        ? weather.hourly.filter((h) => {
          const dates = daily.map((d) => d.date);
          return dates.some((date) => h.time.startsWith(date));
        })
        : weather.hourly;

  const targetIdMap: Record<string, string> = {
    radar: "weather-map",
    pyltsa: "environmental-insights",
    dorogi: "road-conditions",
    "gm-aktivnost": "geomagnetic",
  };
  const targetId = targetIdMap[active];

  const featureIntros: Record<string, { title: string; desc: string; icon: string }> = {
    radar: {
      title: `Радар осадков онлайн в городе ${city.name}`,
      desc: `Интерактивная карта осадков отражает движение дождевых туч, грозовых фронтов и снегопадов в реальном времени. Данные обновляются каждые 10 минут, позволяя точно определить время начала и окончания осадков в городе ${city.name}.`,
      icon: "📡",
    },
    pyltsa: {
      title: `Аллергопрогноз и концентрация пыльцы в городе ${city.name}`,
      desc: `Аллергологический мониторинг помогает оценить риск возникновения симптомов поллиноза. Здесь представлена информация о концентрации пыльцы берёзы, ольхи, злаковых и сорных трав (амброзии), а также общий индекс качества воздуха в городе ${city.name}.`,
      icon: "🌱",
    },
    dorogi: {
      title: `Погода на дорогах и условия для водителей в городе ${city.name}`,
      desc: `Оценка дорожных условий учитывает температуру дорожного покрытия, риск гололедицы, видимость на трассах и порывы ветра. Используйте эти данные для безопасного управления автомобилем в городе ${city.name} и на пригородных трассах.`,
      icon: "🚗",
    },
    "gm-aktivnost": {
      title: `Геомагнитная активность и магнитные бури в городе ${city.name}`,
      desc: `Прогноз геомагнитного фона отражает уровень возмущений магнитного поля Земли (Kp-индекс). Значения Kp ≥ 4 указывают на магнитную бурю, которая может оказывать влияние на самочувствие метеозависимых людей.`,
      icon: "🧲",
    },
  };
  const featureIntro = featureIntros[active];

  const isDailyRangeTab = [
    "tomorrow",
    "zavtra",
    "weekend",
    "vykhodnye",
    "3",
    "3-dnya",
    "7",
    "7-dney",
    "10",
    "10-dney",
    "14",
    "14-dney",
    "mesyats",
  ].includes(active);

  return (
    <PageShell favorites={favorites}>
      <RememberLastCity slug={city.slug} />
      <CategoryTabBar slug={city.slug} active={active} />
      {targetId && <AutoScrollTarget targetId={targetId} />}

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:space-y-6 sm:py-6 sm:px-6">
        <AlertBanner alerts={alerts} />

        {/* Feature Specific Intro Banner */}
        {featureIntro && (
          <div className="rounded-2xl bg-sky-50/90 border border-sky-200/80 p-4 sm:p-5 text-sky-950 shadow-xs space-y-1.5 animate-fade-in-up">
            <h1 className="text-base sm:text-lg font-bold flex items-center gap-2 text-sky-950">
              <span>{featureIntro.icon}</span>
              <span>{featureIntro.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-cloud-600 leading-relaxed">
              {featureIntro.desc}
            </p>
          </div>
        )}

        {/* Action Header Bar (Favorites & Notifications) */}
        <div className="flex items-center justify-end gap-2 animate-fade-in-up stagger-1 motion-reduce:animate-none">
          <NotificationPrompt />
          <FavoriteButton cityId={city.id} initialFavorited={favorited} />
        </div>

        {/* ARCHIVE TAB */}
        {active === "archive" ? (
          <HistoricalArchivePanel
            latitude={city.latitude}
            longitude={city.longitude}
            cityName={city.name}
          />
        ) : (
          <>
            {/* Header Summary / Hero Card for All Tabs */}
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
                  today={tomorrowOnly || active === "zavtra" || active === "tomorrow" ? weather.daily[1] : (hasYesterdayData && weather.yesterday ? weather.yesterday.daily : weather.daily[0])}
                  hourly={weather.hourly}
                  geomagneticKp={geomagnetic?.kp ? Math.round(geomagnetic.kp) : 2}
                  timezone={weather.timezone || city.timezone || undefined}
                  fetchedAt={weather.fetchedAt}
                  activeTab={active}
                />
              )}
            </div>

            {/* VCHERA TAB */}
            {(active === "vchera" || isYesterday) && (
              <div className="space-y-6 animate-fade-in-up stagger-3 motion-reduce:animate-none">
                {hours.length > 0 && (
                  <YesterdayHourlyTable
                    hours={hours}
                    timezone={weather.timezone || city.timezone || undefined}
                  />
                )}
                <AstronomyCard
                  today={weather.yesterday?.daily || weather.daily[0]}
                  latitude={city.latitude}
                  longitude={city.longitude}
                  timezone={weather.timezone || city.timezone || undefined}
                />
              </div>
            )}

            {/* NOW TAB (Live Weather Details) */}
            {active === "now" && (
              <div className="space-y-6 pt-4 border-t border-sky-100/60 animate-fade-in-up stagger-3 motion-reduce:animate-none">
                {showHourly && hours.length > 0 && (
                  <div className="space-y-6 sm:space-y-8">
                    <HourlyForecast hours={hours} />
                  </div>
                )}
                <section id="weather-map" className="scroll-mt-24 space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Радар осадков в режиме реального времени ({city.name})
                  </h2>
                  <RadarMap latitude={city.latitude} longitude={city.longitude} cityName={city.name} layer="precip" />
                </section>

                {airQuality && <AirQualityBlock aqi={airQuality} />}
                <RoadConditionCard current={weather.current} />
                <GeomagneticCard data={geomagnetic} />
              </div>
            )}

            {/* TODAY TAB (Comprehensive Full View) */}
            {active === "today" && (
              <>
                {showHourly && hours.length > 0 && (
                  <div className="space-y-6 sm:space-y-8 animate-fade-in-up stagger-4 motion-reduce:animate-none">
                    <HourlyChart hours={hours} />
                    <HourlyForecast hours={hours} />
                  </div>
                )}

                <div className="animate-fade-in-up stagger-5 motion-reduce:animate-none">
                  <AstronomyCard
                    today={weather.daily[0]}
                    latitude={city.latitude}
                    longitude={city.longitude}
                    timezone={weather.timezone || city.timezone || undefined}
                  />
                </div>

                <div className="animate-fade-in-up stagger-6 motion-reduce:animate-none">
                  <DailyForecast days={daily} hourly={weather.hourly} />
                </div>

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

                  {airQuality && <AirQualityBlock aqi={airQuality} />}
                  <RoadConditionCard current={weather.current} />
                  <GeomagneticCard data={geomagnetic} />
                </div>

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
              </>
            )}

            {/* FORECAST RANGE TABS (zavtra, 3-dnya, 7-dney, 10-dney, 14-dney, vykhodnye, mesyats) */}
            {isDailyRangeTab && (
              <div className="animate-fade-in-up stagger-3 motion-reduce:animate-none space-y-6">
                {active === "mesyats" && (
                  <div className="rounded-2xl bg-white/80 p-4 border border-sky-100/90 shadow-2xs backdrop-blur-md text-xs text-sky-900 flex items-center gap-2.5">
                    <span className="text-base shrink-0">ℹ️</span>
                    <span>Точный ежедневный метеопрогноз доступен на 14 дней вперёд.</span>
                  </div>
                )}
                <DailyForecast days={daily} hourly={weather.hourly} />
              </div>
            )}

            {/* RADAR TAB */}
            {active === "radar" && (
              <div className="animate-fade-in-up stagger-3 motion-reduce:animate-none space-y-4">
                <section id="weather-map" className="scroll-mt-24 space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Интерактивная карта и радар осадков ({city.name})
                  </h2>
                  <RadarMap latitude={city.latitude} longitude={city.longitude} cityName={city.name} layer="precip" />
                </section>
              </div>
            )}

            {/* PYLTSA (POLLEN) TAB */}
            {active === "pyltsa" && (
              <div id="environmental-insights" className="animate-fade-in-up stagger-3 motion-reduce:animate-none scroll-mt-24">
                {airQuality ? (
                  <AirQualityBlock aqi={airQuality} />
                ) : (
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center text-slate-500 text-sm">
                    Данные о качестве воздуха и концентрации пыльцы временно недоступны.
                  </div>
                )}
              </div>
            )}

            {/* DOROGI (ROADS) TAB */}
            {active === "dorogi" && (
              <div id="road-conditions" className="animate-fade-in-up stagger-3 motion-reduce:animate-none scroll-mt-24">
                <RoadConditionCard current={weather.current} />
              </div>
            )}

            {/* GM-AKTIVNOST (GEOMAGNETIC) TAB */}
            {active === "gm-aktivnost" && (
              <div id="geomagnetic" className="animate-fade-in-up stagger-3 motion-reduce:animate-none scroll-mt-24">
                <GeomagneticCard data={geomagnetic} />
              </div>
            )}


          </>
        )}

        {/* Country Related Cities (Internal SEO linking for all cities in target country) */}
        <CountryRelatedCities city={city} />

        {/* Footer info & nearby cities on all tabs */}
        <NearbyCities cities={nearby} />

        <p className="text-xs text-cloud-400" suppressHydrationWarning>
          Источник: {weather.provider} · обновлено{" "}
          <span suppressHydrationWarning>
            {formatDateTimeRu(weather.fetchedAt, weather.timezone || city.timezone || undefined)}
          </span>{" "}
          · {ru.attribution}
        </p>
      </main>
    </PageShell>
  );
}
