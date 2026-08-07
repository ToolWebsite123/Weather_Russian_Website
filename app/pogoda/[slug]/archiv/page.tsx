import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity, listPopularCities } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { config } from "@/lib/config";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(20).catch(() => []);
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };

  const locative = getCityLocative(city.name);
  const title = `Архив погоды ${locative} — климатические нормы и метеонаблюдения | WeatherHub`;
  const description = `Архив погоды ${locative} за прошлые года: климатические нормы по месяца, температурные рекорды и статистика осадков.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/archiv`;

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

export default function ArchivePage({ params }: Props) {
  return <CityWeatherView slug={params.slug} active="archive" />;
}
