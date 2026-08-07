import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity, listPopularCities } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { config } from "@/lib/config";

export const revalidate = 900; // 15-minute ISR revalidation matching weather cache TTL

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(50).catch(() => []);
  return cities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} сегодня — точный прогноз погоды | WeatherHub`;
  const description = ru.metaDescription(city.name);
  const url = `${config.siteUrl}/pogoda/${city.slug}`;

  return {
    title,
    description,
    robots: city.isCurated ? undefined : { index: false, follow: true },
    alternates: {
      canonical: url,
    },
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

export default function CityPage({
  params,
  searchParams,
}: Props & { searchParams?: { view?: string } }) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="today"
      dailyLimit={7}
      isYesterday={searchParams?.view === "yesterday"}
    />
  );
}

