import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { getFavoritesForSession } from "@/lib/weather/city-page";

import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: "Контакты и обратная связь | WeatherHub",
  description:
    "Контакты и информация о метеорологическом проекте WeatherHub.",
  alternates: {
    canonical: `${config.siteUrl}/contact`,
  },
};

export default async function ContactPage() {
  const favorites = await getFavoritesForSession().catch(() => []);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <nav className="text-xs text-cloud-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-sky-800 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-sky-950 font-medium">Контакты</span>
        </nav>

        <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 backdrop-blur space-y-6 sm:p-8">
          <h1 className="font-serif text-h1 font-bold text-sky-950">
            Контакты проекта
          </h1>

          <div className="space-y-4 text-sm leading-relaxed text-cloud-700">
            <p>
              <strong>WeatherHub</strong> — некоммерческий веб-сервис погоды, создан для быстрого и удобного просмотра метеорологических прогнозов для городов России.
            </p>

            <div className="rounded-xl bg-sky-50/70 p-4 ring-1 ring-sky-100 space-y-2">
              <h2 className="font-semibold text-sky-950 text-base">
                Вопросы и предложения
              </h2>
              <p className="text-xs text-cloud-600">
                По вопросам работы сервиса, замечаниям к точности или предложениям по улучшению функционала вы можете обратиться через страницу проекта на GitHub или через форму обратной связи разработчиков.
              </p>
            </div>

            <div className="pt-2 text-xs text-cloud-500 space-y-1">
              <p>
                <strong>Метеорологический провайдер:</strong> Open-Meteo API (GPL v3 / CC BY 4.0)
              </p>
              <p>
                <strong>Геомагнитные данные:</strong> NOAA Space Weather Prediction Center
              </p>
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
