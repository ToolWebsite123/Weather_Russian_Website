import {
  ComfortIndices,
  CurrentWeatherCard,
  DailyForecast,
  DayPartsGrid,
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
import { getUpcomingWeekendDays } from "@/lib/weather/weekend";
import { getLatestArticles } from "@/lib/content/articles";
import { ru } from "@/lib/i18n/ru";
import { notFound } from "next/navigation";

export async function CityWeatherView({
  slug,
  active,
  dailyLimit,
  showHourly = true,
  tomorrowOnly = false,
  weekendOnly = false,
}: {
  slug: string;
  active: "today" | "tomorrow" | "weekend" | "3" | "7" | "10" | "14";
  dailyLimit?: number;
  showHourly?: boolean;
  tomorrowOnly?: boolean;
  weekendOnly?: boolean;
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
  } else if (weekendOnly) {
    daily = getUpcomingWeekendDays(weather.daily);
  } else if (dailyLimit) {
    daily = weather.daily.slice(0, dailyLimit);
  }

  const focusDate = tomorrowOnly
    ? weather.daily[1]?.date
    : weekendOnly
      ? daily[0]?.date
      : weather.daily[0]?.date;

  const hours = tomorrowOnly
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
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-4 sm:space-y-8 sm:py-8 sm:px-6">
        <AlertBanner alerts={alerts} />

        <div className="flex items-center justify-end gap-2 animate-fade-in-up stagger-1 motion-reduce:animate-none">
          <NotificationPrompt />
          <FavoriteButton cityId={city.id} initialFavorited={favorited} />
        </div>

        <div className="animate-fade-in-up stagger-2 motion-reduce:animate-none">
          <CurrentWeatherCard
            cityName={city.name}
            current={weather.current}
            today={weather.daily[0]}
            hourly={weather.hourly}
          />
        </div>

        <div className="animate-fade-in-up stagger-3 motion-reduce:animate-none">
          <RoadConditionCard current={weather.current} />
        </div>

        <div className="animate-fade-in-up stagger-4 motion-reduce:animate-none">
          <AstronomyCard
            today={tomorrowOnly ? weather.daily[1] : weather.daily[0]}
            latitude={city.latitude}
            longitude={city.longitude}
            timezone={weather.timezone || city.timezone || undefined}
          />
        </div>

        {focusDate && (
          <div className="animate-fade-in-up stagger-5 motion-reduce:animate-none">
            <DayPartsGrid hourly={weather.hourly} date={focusDate} />
          </div>
        )}

        <div className="animate-fade-in-up stagger-5 motion-reduce:animate-none">
          <ComfortIndices current={weather.current} hourly={weather.hourly} aqi={aqi} />
        </div>

        {active === "today" && (
          <div className="animate-fade-in-up stagger-6 motion-reduce:animate-none">
            <RecommendationsCard
              current={weather.current}
              today={weather.daily[0]}
              hourly={weather.hourly}
              aqi={aqi}
              activeAlerts={alerts}
            />
          </div>
        )}

        <div className="animate-fade-in-up stagger-6 motion-reduce:animate-none">
          <GeomagneticCard data={geomagnetic} />
        </div>

        {aqi && (
          <div className="animate-fade-in-up stagger-7 motion-reduce:animate-none">
            <AirQualityBlock aqi={aqi} />
          </div>
        )}

        {showHourly && hours.length > 0 && (
          <div className="space-y-6 sm:space-y-8 animate-fade-in-up stagger-7 motion-reduce:animate-none">
            <HourlyChart hours={hours} />
            <HourlyForecast hours={hours} />
          </div>
        )}

        <div className="animate-fade-in-up stagger-8 motion-reduce:animate-none">
          <DailyForecast days={daily} hourly={weather.hourly} />
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

        <div className="animate-fade-in-up stagger-8 motion-reduce:animate-none">
          <WeatherMap
            latitude={city.latitude}
            longitude={city.longitude}
            cityName={city.name}
            showPrecip
          />
        </div>

        {articles.length > 0 && (
          <div className="animate-fade-in-up stagger-8 motion-reduce:animate-none">
            <RelatedArticles articles={articles} />
          </div>
        )}

        <CityWeatherFaq city={city} weather={weather} />

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

