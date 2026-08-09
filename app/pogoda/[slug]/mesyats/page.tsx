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
  const title = `Погода ${locative} на месяц (30 дней) — точный долгосрочный прогноз | WeatherHub`;
  const description = `Прогноз погоды ${locative} на месяц (30 дней): температуры воздуха, осадки, тенденции и архивные климатические нормы.`;
  const url = `${config.siteUrl}/pogoda/${city.slug}/mesyats`;

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: ru.brand, locale: "ru_RU", type: "website" },
  };
}

export default function MesyatsPage({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="mesyats"
      dailyLimit={30}
      showHourly={false}
    />
  );
}
