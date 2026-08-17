export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import {
  listPopularCities,
  loadCityWeather,
  buildCityOgImageUrl,
} from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { shouldIndexCity, buildCityUrl } from "@/lib/cities";
import { config } from "@/lib/config";


type Props = { params: { slug: string } };


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadCityWeather(params.slug);
  if (!data) return { title: ru.brand };
  const { city, weather } = data;

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} на 10 дней — подробный прогноз | WeatherHub`;
  const description = `Подробный прогноз погоды ${locative} на 10 дней: изменения температуры, вероятность дождя и снега.`;
  const url = `${config.siteUrl}${buildCityUrl(city, "10-days")}`;
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

export default function TenDaysWeatherPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="10"
      dailyLimit={10}
    />
  );
}
