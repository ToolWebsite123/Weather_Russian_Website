import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import {
  listPopularCities,
  loadCityWeather,
  buildCityOgImageUrl,
} from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { shouldIndexCity } from "@/lib/cities";
import { config } from "@/lib/config";

export const revalidate = 900;

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
  const title = `Погода ${locative} на 2 недели — долгосрочный прогноз | WeatherHub`;
  const description = `Прогноз погоды ${locative} на 2 недели (14 дней).`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/2-weeks`;
  const ogImage = buildCityOgImageUrl(city, weather);

  return {
    title,
    description,
    robots: shouldIndexCity(city) ? undefined : { index: false, follow: true },
    alternates: { canonical: `${config.siteUrl}/pogoda/${city.slug}/14-dney` },
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

export default function TwoWeeksAliasPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="14"
      dailyLimit={14}
    />
  );
}
