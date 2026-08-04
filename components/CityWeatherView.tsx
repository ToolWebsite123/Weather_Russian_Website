import {
  ComfortIndices,
  CurrentWeatherCard,
  DailyForecast,
  DayPartsGrid,
  ForecastTabs,
  HourlyForecast,
  NearbyCities,
  WeatherMap,
} from "@/components/WeatherPanels";
import { Suspense } from "react";
import { AstronomyCard } from "@/components/AstronomyCard";
import { HistoricalComparisonCard } from "@/components/HistoricalComparisonCard";
import { RecommendationsCard } from "@/components/RecommendationsCard";
import { AlertBanner } from "@/components/AlertBanner";
import { HourlyChart } from "@/components/HourlyChart";
import { AirQualityBlock } from "@/components/AirQualityBlock";
import { GeomagneticCard } from "@/components/GeomagneticCard";
import { RoadConditionCard } from "@/components/RoadConditionCard";
import { CityWeatherFaq } from "@/components/CityWeatherFaq";
import { FavoriteButton } from "@/components/FavoriteButton";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import { PageShell } from "@/components/SiteChrome";
import { RememberLastCity } from "@/components/RememberLastCity";
import { RelatedArticles } from "@/components/RelatedArticles";
import {
  getFavoritesForSession,
  isCityFavorited,
  loadCityWeather,
} from "@/lib/weather/city-page";
import { getNearbyCities } from "@/lib/weather/nearby";
import { fetchAirQuality } from "@/lib/weather/air-quality";
import { fetchGeomagneticData } from "@/lib/weather/geomagnetic";
import { getActiveAlerts } from "@/lib/weather/alerts";
import { getLatestArticles } from "@/lib/content/articles";
import { ru } from "@/lib/i18n/ru";
import { notFound } from "next/navigation";

export async function CityWeatherView({
  slug,
  active,
  dailyLimit,
  showHourly = true,
  tomorrowOnly = false,
}: {
  slug: string;
  active: "today" | "tomorrow" | "3" | "7" | "10" | "14";
  dailyLimit?: number;
  showHourly?: boolean;
  tomorrowOnly?: boolean;
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

  const [favorites, favorited, nearby, aqi, geomagnetic, articles] = await Promise.all([
    getFavoritesForSession().catch(() => []),
    isCityFavorited(city.id).catch(() => false),
    getNearbyCities(city, 8).catch(() => []),
    fetchAirQuality(city.latitude, city.longitude).catch(() => null),
    fetchGeomagneticData().catch(() => null),
    Promise.resolve(getLatestArticles(2)),
  ]);

  let daily = weather.daily;
  if (tomorrowOnly) {
    daily = weather.daily.slice(1, 2);
  } else if (dailyLimit) {
    daily = weather.daily.slice(0, dailyLimit);
  }

  const focusDate = tomorrowOnly
    ? weather.daily[1]?.date
    : weather.daily[0]?.date;

  const hours = tomorrowOnly
    ? weather.hourly.filter((h) => {
        const day = weather.daily[1]?.date;
        return day && h.time.startsWith(day);
      })
    : weather.hourly;

  return (
    <PageShell favorites={favorites}>
      <RememberLastCity slug={city.slug} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:space-y-8 sm:py-8 sm:px-6">
        <AlertBanner alerts={alerts} />

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <ForecastTabs slug={city.slug} active={active} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationPrompt />
            <FavoriteButton cityId={city.id} initialFavorited={favorited} />
          </div>
        </div>

        <CurrentWeatherCard
          cityName={city.name}
          current={weather.current}
          today={weather.daily[0]}
          hourly={weather.hourly}
        />

        <RoadConditionCard current={weather.current} />

        <AstronomyCard
          today={tomorrowOnly ? weather.daily[1] : weather.daily[0]}
          latitude={city.latitude}
          longitude={city.longitude}
        />

        {focusDate && (
          <DayPartsGrid hourly={weather.hourly} date={focusDate} />
        )}

        <ComfortIndices current={weather.current} hourly={weather.hourly} aqi={aqi} />

        {active === "today" && (
          <RecommendationsCard
            current={weather.current}
            today={weather.daily[0]}
            hourly={weather.hourly}
            aqi={aqi}
            activeAlerts={alerts}
          />
        )}

        <GeomagneticCard data={geomagnetic} />

        {aqi && <AirQualityBlock aqi={aqi} />}

        {showHourly && hours.length > 0 && (
          <>
            <HourlyChart hours={hours} />
            <HourlyForecast hours={hours} />
          </>
        )}

        <DailyForecast days={daily} hourly={weather.hourly} />

        {active === "today" && (
          <Suspense fallback={null}>
            <HistoricalComparisonCard
              todayTempMax={weather.daily[0].tempMax}
              todayDate={weather.daily[0].date}
              latitude={city.latitude}
              longitude={city.longitude}
            />
          </Suspense>
        )}

        <WeatherMap
          latitude={city.latitude}
          longitude={city.longitude}
          cityName={city.name}
          showPrecip
        />

        <CityWeatherFaq city={city} weather={weather} />

        <NearbyCities cities={nearby} />

        <RelatedArticles articles={articles} />

        <p className="text-xs text-cloud-400">
          Источник: {weather.provider} · обновлено{" "}
          {new Date(weather.fetchedAt).toLocaleString("ru-RU")} ·{" "}
          {ru.attribution}
        </p>
      </main>
    </PageShell>
  );
}

