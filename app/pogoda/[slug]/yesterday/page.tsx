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
  const title = `Погода ${locative} вчера — факты и история температуры | WeatherHub`;
  const description = `Фактическая погода ${locative} за вчерашний день: прошедшие осадки, температура воздуха, влажность и атмосферное давление.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/yesterday`;
  const ogImage = buildCityOgImageUrl(city, weather);

  return {
    title,
    description,
    robots: shouldIndexCity(city) ? undefined : { index: false, follow: true },
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

export default function YesterdayAliasPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="vchera"
      isYesterday
    />
  );
}
