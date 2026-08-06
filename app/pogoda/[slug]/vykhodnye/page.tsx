import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity, listPopularCities } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(20).catch(() => []);
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} на выходные — точный прогноз на субботу и воскресенье | WeatherHub`;
  const description = `Подробный прогноз погоды ${locative} на ближайшие выходные (суббота и воскресенье): температура, вероятность осадков, скорость ветра и УФ-индекс.`;
  const url = `https://weatherhub.ru/pogoda/${city.slug}/vykhodnye`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: ru.brand, locale: "ru_RU", type: "website" },
  };
}

export default function WeekendPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="weekend"
      weekendOnly
      showHourly
    />
  );
}
