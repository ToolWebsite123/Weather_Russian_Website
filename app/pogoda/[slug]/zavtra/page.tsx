import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import { resolveCity } from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await resolveCity(params.slug);
  if (!city) return { title: ru.brand };
  return {
    title: `${ru.tomorrow}: ${ru.forecastFor(city.name)} — ${ru.brand}`,
    description: `Прогноз погоды на завтра в ${city.name}.`,
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
