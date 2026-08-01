import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };
  return {
    title: `${ru.forecastFor(city.name)} — ${ru.brand}`,
    description: ru.metaDescription(city.name),
  };
}

export default function CityPage({ params }: Props) {
  return (
    <CityWeatherView slug={params.slug} active="today" dailyLimit={7} />
  );
}
