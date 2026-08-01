import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };
  return {
    title: `Погода в ${city.name} на 3 дня — ${ru.brand}`,
    description: `Прогноз на 3 дня в ${city.name}.`,
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
