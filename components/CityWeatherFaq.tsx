import { getCityGenitive, getCityLocative } from "@/lib/i18n/declension";
import { getCityClimateProfile } from "@/lib/content/city-climate";
import type { City } from "@prisma/client";
import type { WeatherBundle } from "@/types/weather";
import { formatPressureMmHg, formatTemp } from "@/lib/cities";
import { weatherCodeLabel } from "@/lib/weather/wmo";
import { config } from "@/lib/config";

interface Props {
  city: City;
  weather: WeatherBundle;
}

export function CityWeatherFaq({ city, weather }: Props) {
  const locative = getCityLocative(city.name); // e.g. "в Санкт-Петербурге"
  const genitive = getCityGenitive(city.name); // e.g. "Санкт-Петербурга"
  const current = weather.current;
  const today = weather.daily[0];

  const profile = getCityClimateProfile(city.slug, city.name);
  const pressureStr = formatPressureMmHg(current.pressure);
  const conditionStr = weatherCodeLabel(current.weatherCode);

  // Generate specific FAQ items targeting long-tail searches (e.g. "погода спб", "давление в спб сегодня")
  const defaultFaqs = [
    {
      question: `Какая погода ${locative} сегодня?`,
      answer: `Сегодня ${locative} температура воздуха составляет ${formatTemp(current.temperature)}, ощущается как ${formatTemp(current.feelsLike)}. Погодные условия: ${conditionStr.toLowerCase()}. Влажность воздуха — ${Math.round(current.humidity)}%, скорость ветра — ${current.windSpeed.toFixed(1)} м/с.`,
    },
    {
      question: `Какое атмосферное давление ${locative} сейчас?`,
      answer: `Текущее атмосферное давление ${locative} составляет ${pressureStr}. Для ${genitive} нормальным уровнем давления считается ${profile.pressureNorm}.`,
    },
    {
      question: `Какая минимальная и максимальная температура ожидается ${locative}?`,
      answer: today
        ? `Сегодня ${locative} температура воздуха будет находиться в диапазоне от ${formatTemp(today.tempMin)} ночью до ${formatTemp(today.tempMax)} в течение дня.`
        : `Максимальная температура ${locative} ожидается в районе ${formatTemp(current.temperature)}.`,
    },
    {
      question: `Где посмотреть точный прогноз погоды ${locative} на 10 и 14 дней?`,
      answer: `На нашем сервисе WeatherHub доступен точный и регулярно обновляемый прогноз погоды ${locative} на сегодня, завтра, 3, 7, 10 и 14 дней по данным метеорологической модели Open-Meteo.`,
    },
  ];

  const extraFaqs = (profile.faqs ?? []).filter(
    (f) => !f.question.toLowerCase().includes("давление"),
  );
  const faqs = [...defaultFaqs, ...extraFaqs];

  // Schema.org FAQPage JSON-LD
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  const publishedIso = current.time
    ? `${current.time.split("T")[0]}T00:00:00.000Z`
    : "2026-01-01T00:00:00.000Z";

  // Schema.org WeatherForecast JSON-LD
  const weatherSchema = {
    "@context": "https://schema.org",
    "@type": "WeatherForecast",
    name: `Прогноз погоды ${locative}`,
    url: `${config.siteUrl}/pogoda/${city.slug}`,
    datePublished: publishedIso,
    validFrom: publishedIso,
    location: {
      "@type": "Place",
      name: city.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: city.name,
        addressCountry: city.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.latitude,
        longitude: city.longitude,
      },
    },
  };

  return (
    <section className="space-y-6">
      {/* Schema.org Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(weatherSchema) }}
      />

      {/* Editorial Overview for SEO */}
      <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 backdrop-blur sm:p-6">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          Особенности погоды и климата {locative}
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-cloud-700">
          <p>
            {city.name} находится в климатической зоне: <span className="font-medium text-sky-900">{profile.climateType}</span>. 
            {profile.specialNote}
          </p>
          <p>
            Актуальный прогноз погоды на сервисе WeatherHub обновляется каждые 15 минут, обеспечивая 
            точные данные о температуре, скорости ветра, уровне давления ({pressureStr}) и вероятности осадков.
          </p>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 backdrop-blur sm:p-6">
        <h2 className="font-serif text-h2 font-semibold text-sky-950">
          Частые вопросы о погоде {locative}
        </h2>
        <div className="mt-4 divide-y divide-sky-100">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-3 font-medium text-sky-950">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-base group-open:text-sky-700">
                <span>{faq.question}</span>
                <span className="shrink-0 text-sky-500 transition-transform group-open:rotate-180">
                  ↓
                </span>
              </summary>
              <p className="mt-2 text-sm font-normal leading-relaxed text-cloud-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
