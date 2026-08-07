import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity, listPopularCities } from "@/lib/weather/city-page";
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
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} на 3 дня — точный почасовой прогноз | WeatherHub`;
  const description = `Подробный прогноз погоды ${locative} на 3 дня: температура воздуха по часам, вероятность осадков и ветер.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/3-dnya`;

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: ru.brand, locale: "ru_RU", type: "website" },
  };
}

export default function Days3Page({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="3"
      dailyLimit={3}
      showHourly={false}
    />
  );
}

