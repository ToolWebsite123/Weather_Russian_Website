import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import {
  listPopularCities,
  loadCityWeather,
  buildCityOgImageUrl,
} from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { config } from "@/lib/config";

export const revalidate = 900; // 15-minute ISR revalidation matching weather cache TTL

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(20).catch(() => []);
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadCityWeather(params.slug);
  if (!data) return { title: ru.brand };
  const { city, weather } = data;

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} на 14 дней (на 2 недели) — точный прогноз | WeatherHub`;
  const description = `Долгосрочный прогноз погоды ${locative} на 14 дней (2 недели): температурные графики, осадки и ветер.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/14-dney`;
  const ogImage = buildCityOgImageUrl(city, weather);

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: ru.brand,
      locale: "ru_RU",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Days14Page({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="14"
      dailyLimit={14}
      showHourly={false}
    />
  );
}

