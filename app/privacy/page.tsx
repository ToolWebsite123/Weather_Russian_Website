import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteChrome";
import { getFavoritesForSession } from "@/lib/weather/city-page";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | WeatherHub",
  description:
    "Политика обработки персональных данных сервиса WeatherHub: прозрачные правила сбора, хранения и защиты данных пользователей.",
  alternates: {
    canonical: "https://weatherhub.ru/privacy",
  },
};

export default async function PrivacyPage() {
  const favorites = await getFavoritesForSession().catch(() => []);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <nav className="text-xs text-cloud-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-sky-800 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <span className="text-sky-950 font-medium">Политика конфиденциальности</span>
        </nav>

        <section className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-sky-100 backdrop-blur space-y-6 sm:p-8">
          <h1 className="font-serif text-h1 font-bold text-sky-950">
            Политика конфиденциальности
          </h1>

          <div className="space-y-4 text-sm leading-relaxed text-cloud-700">
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты данных пользователей сервиса <strong>WeatherHub</strong> в соответствии с требованиями Федерального закона РФ № 152-ФЗ «О персональных данных».
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              1. Какая информация собирается
            </h2>
            <p>
              Сервис WeatherHub разработан по принципу минимального сбора данных и не требует регистрации личного кабинета:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Избранные города и настройки:</strong> сохраняются в анонимных куки-файлах (cookie) браузера пользователя.
              </li>
              <li>
                <strong>Push-уведомления:</strong> при явном согласии пользователя сохраняется технический идентификатор веб-подписки (`PushSubscription`) в защищённой базе данных сервера для доставки предупреждений о неблагоприятной погоде.
              </li>
              <li>
                <strong>Аналитика и логи:</strong> сервер может фиксировать технические заголовки запросов (IP-адрес, тип браузера) исключительно для обеспечения защиты от DDoS-атак и выявления ошибок.
              </li>
            </ul>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              2. Использование данных
            </h2>
            <p>
              Собранные технические данные используются строго по назначению: отображение сохранённых городов, отправка штормовых предупреждений и стабильная работа приложения. Мы не передаём и не продаём информацию третьим лицам.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              3. Хранение и безопасность
            </h2>
            <p>
              Технические данные подписок хранятся в защищённой базе данных PostgreSQL. Пароли, персональные имена и другие конфиденциальные реквизиты не собираются и не хранятся.
            </p>

            <h2 className="font-serif text-h2 font-semibold text-sky-950 pt-2">
              4. Управление данными и удаление
            </h2>
            <p>
              Вы можете полностью удалить сохранённые города, очистив файлы cookie в настройках вашего браузера. От подписки на push-уведомления можно отказаться в любой момент в настройках разрешений браузера.
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
