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
  const title = `Погода ${locative} на завтра — подробный точный прогноз | WeatherHub`;
  const description = `Точный прогноз погоды ${locative} на завтра: температура по часам, вероятность осадков, скорость ветра и атмосферное давление.`;
  const url = `https://weatherhub.ru/pogoda/${city.slug}/zavtra`;

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
    },
  };
}

export default function TomorrowPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="tomorrow"
      tomorrowOnly
      showHourly
    />
  );
}

