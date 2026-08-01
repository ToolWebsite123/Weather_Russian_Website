import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };
  return {
    title: `Погода в ${city.name} на 10 дней — ${ru.brand}`,
    description: `Прогноз на 10 дней в ${city.name}.`,
  };
}

export default function Days10Page({ params }: Props) {
  return (
    <CityWeatherView
      slug={params.slug}
      active="10"
      dailyLimit={10}
      showHourly={false}
    />
  );
}
