import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { getFavoritesForSession } from "@/lib/weather/city-page";

import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Пользовательское соглашение | WeatherHub",
  description:
    "Условия использования сервиса погоды WeatherHub: правила пользования, отказы от ответственности и источники данных.",
  alternates: {
    canonical: `${config.siteUrl}/terms`,
  },
};

export default async function TermsPage() {
  const favorites = await getFavoritesForSession().catch(() => []);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <nav className="text-xs text-cloud-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-sky-800 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-sky-950 font-medium">Пользовательское соглашение</span>
        </nav>

        <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 backdrop-blur space-y-6 sm:p-8">
          <h1 className="font-serif text-h1 font-bold text-sky-950">
            Пользовательское соглашение
          </h1>

          <div className="space-y-4 text-sm leading-relaxed text-cloud-700">
            <p>
              Добро пожаловать в метеорологический сервис <strong>WeatherHub</strong>. Используя наш сайт, вы соглашаетесь с настоящими условиями использования.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              1. Назначение сервиса
            </h2>
            <p>
              WeatherHub является некоммерческим информационным сервисом, предоставляющим прогнозы погоды для городов России. Сервис предназначен для личного использования гражданами в ознакомительных и бытовых целях.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              2. Источники данных и оговорка о точности
            </h2>
            <p>
              Метеорологические данные (температура, влажность, скорость ветра, атмосферное давление, качество воздуха и геомагнитные показатели) формируются на основе открытых данных метеорологической службы <strong>Open-Meteo</strong> и модели <strong>NOAA</strong>.
            </p>
            <p>
              Прогнозы погоды являются вероятностными расчётами и не гарантируют 100% абсолютную точность. Администрация сервиса не несёт ответственности за финансовые, производственные или личные решения, принятые на основе опубликованных прогнозов.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              3. Интеллектуальная собственность
            </h2>
            <p>
              Дизайн, интерфейс и код сервиса принадлежат проекту WeatherHub. Все метеорологические данные предоставляются с соблюдением открытых лицензий соответствующих поставщиков данных.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              4. Изменение условий
            </h2>
            <p>
              Настоящее соглашение может обновляться по мере развития сервиса. Актуальная версия всегда доступна на этой странице.
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
