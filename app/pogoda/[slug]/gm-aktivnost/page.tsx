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
  const title = `Магнитные бури ${locative} — геомагнитный прогноз и Kp-индекс | WeatherHub`;
  const description = `Прогноз геомагнитной активности и магнитных бурь ${locative}: Kp-индекс, уровень возмущений магнитосферы и рекомендации для метеочувствительных людей.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/gm-aktivnost`;

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: ru.brand, locale: "ru_RU", type: "website" },
  };
}

export default function GmPage({ params }: Props) {
  return <CityWeatherView slug={params.slug} active="gm-aktivnost" />;
}
