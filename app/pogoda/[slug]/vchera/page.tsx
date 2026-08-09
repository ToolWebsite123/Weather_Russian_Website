import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity, listPopularCities } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { config } from "@/lib/config";

export const revalidate = 900;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(20).catch(() => []);
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} вчера — метеонаблюдения за вчерашний день | WeatherHub`;
  const description = `Метеонаблюдения ${locative} за вчерашний день: фактическая температура, влажность, атмосферное давление и сравнение погоды.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/vchera`;

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

export default function YesterdayPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="vchera"
      isYesterday
      showHourly
    />
  );
}
