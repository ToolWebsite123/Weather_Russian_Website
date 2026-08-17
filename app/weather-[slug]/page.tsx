import type { Metadata } from "next";
import { CityWeatherView } from "@/components/CityWeatherView";
import {
  resolveCity,
  listPopularCities,
  loadCityWeather,
  buildCityOgImageUrl,
} from "@/lib/weather/city-page";
import { ru } from "@/lib/i18n/ru";
import { getCityLocative } from "@/lib/i18n/declension";
import { shouldIndexCity, buildCityUrl } from "@/lib/cities";
import { config } from "@/lib/config";

export const revalidate = 900;
export const dynamicParams = true;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cities = await listPopularCities(50).catch(() => []);
  return cities.map((c) => ({ slug: `${c.slug}-${c.id}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadCityWeather(params.slug);
  if (!data) return { title: ru.brand };
  const { city, weather } = data;

  const locative = getCityLocative(city.name);
  const title = `Погода ${locative} сегодня — точный прогноз погоды | WeatherHub`;
  const description = ru.metaDescription(city.name);
  const url = `${config.siteUrl}${buildCityUrl(city)}`;
  const ogImage = buildCityOgImageUrl(city, weather);

  return {
    title,
    description,
    robots: shouldIndexCity(city) ? undefined : { index: false, follow: true },
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function WeatherCityPage({
  params,
  searchParams,
}: Props & { searchParams?: { view?: string } }) {
  const city = await resolveCity(params.slug);
  const cityUrl = city ? `${config.siteUrl}${buildCityUrl(city)}` : "";
  const locative = city ? getCityLocative(city.name) : "";

  const faqSchemaBlock = city
    ? {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Какая погода ${locative} сегодня?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Актуальный прогноз погоды ${locative} на сегодня включает температуру, ощущаемую температуру, влажность, давление и скорость ветра.`,
            },
          },
          {
            "@type": "Question",
            name: `Где посмотреть точный прогноз погоды ${locative} на 10 и 14 дней?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `На сервисе WeatherHub доступен подробный и регулярно обновляемый прогноз погоды ${locative} на сегодня, завтра, 3, 7, 10 и 14 дней.`,
            },
          },
        ],
      }
    : null;

  const jsonLd = city
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Главная",
                item: config.siteUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Все города",
                item: `${config.siteUrl}/gorod`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: `Погода в ${city.name}`,
                item: cityUrl,
              },
            ],
          },
          {
            "@type": "Place",
            name: city.name,
            address: {
              "@type": "PostalAddress",
              addressCountry: city.country,
              addressRegion: city.region || undefined,
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: city.latitude,
              longitude: city.longitude,
            },
          },
          faqSchemaBlock,
        ].filter(Boolean),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CityWeatherView
        slug={params.slug}
        active="today"
        dailyLimit={7}
        isYesterday={searchParams?.view === "yesterday"}
      />
    </>
  );
}
