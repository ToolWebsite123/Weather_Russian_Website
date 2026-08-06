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
  const title = `Погода ${locative} на 7 дней (на неделю) — точный прогноз | WeatherHub`;
  const description = `Точный прогноз погоды ${locative} на 7 дней (неделю): температура днём и ночью, вероятности осадков и тенденции погоды.`;
  const url = `https://weatherhub.ru/pogoda/${city.slug}/7-dney`;

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: ru.brand, locale: "ru_RU", type: "website" },
  };
}

export default function Days7Page({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="7"
      dailyLimit={7}
      showHourly={false}
    />
  );
}

