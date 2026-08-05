# WeatherHub

Современный и точный сервис прогноза погоды для 272 городов России на базе Next.js 14, TypeScript, Tailwind, Prisma, Neon PostgreSQL, Open-Meteo и Web Push.

## Stack & Технологии

- **Framework**: Next.js 14 App Router + TypeScript (strict mode)
- **Styling**: Tailwind CSS (палитра sky / sun / cloud) + Leaflet CSS
- **Database & ORM**: Prisma ORM + Neon Serverless PostgreSQL (`prisma/schema.prisma`)
- **Primary Data Provider**: Open-Meteo API (`lib/weather/open-meteo.ts`)
- **Push Notifications**: Web Push API (`web-push`), Service Worker (`public/sw.js`), VAPID ключи
- **Rate Limiting**: Distributed Sliding Window Limiter на базе Upstash Redis (`lib/rate-limit.ts`)

## Основные возможности

- 📅 **Детализированный прогноз по дням и часам (Forecast Tabs)**: раздельные варианты прогноза на Сегодня, Завтра, 3 дня, 7 дней, 10 дней и 14 дней (`/pogoda/[slug]/...`).
- 🗺️ **Интерактивная карта погоды (Radar Map)**: карта на основе Leaflet с переключением слоёв осадков, температуры и ветра.
- 🧲 **Геомагнитная обстановка (Geomagnetic Card)**: мониторинг магнитных бурь и Kp-индекса.
- 🍃 **Качество воздуха и аллергены (Air Quality & Pollen)**: индикация индексов US AQI, концентрации PM2.5, PM10, O₃, NO₂ и пыльцы (берёза, ольха, злаки, амброзия).
- 🛣️ **Дорожные условия (Road Conditions)**: автоматическая оценка безопасности вождения (гололедица, видимость, мокрое покрытие).
- 📊 **Сравнение с климатической нормой (Historical Comparison)**: сопоставление текущей температуры с историческими наблюдениями прошлых лет.
- 🚨 **Штормовые предупреждения (Weather Alerts)**: автоматическое определение опасных погодных условий (сильный ветер, экстремальный мороз, жара, подтопления).
- 🔔 **Web Push Уведомления**: реальная подписка браузера через Service Worker и защищённая Vercel Cron рассылка экстренных оповещений (`/api/cron/send-weather-alerts`).
- ⭐️ **Избранные города (Favorites)**: быстрая подписка и сохранённые города сессии без регистрации.
- 🏙️ **Полный каталог городов (City Catalog)**: индексируемый каталог 272 городов России (`/gorod`) с алфавитной группировкой.

## Безопасность и Vercel Cron (`CRON_SECRET`)

Эндпоинт рассылки штормовых push-уведомлений (`/api/cron/send-weather-alerts`) защищён авторизационным токеном `CRON_SECRET`:
- **Настройка расписания**: Расписание задано в файле `vercel.json` (`*/30 * * * *` — запуск каждые 30 минут).
- **Настройка авторизации в Vercel**:
  1. Зайдите в **Vercel Dashboard → Settings → Environment Variables**.
  2. Добавьте секретную переменную `CRON_SECRET` (со случайным защищенным ключом).
  3. Vercel Cron автоматически прикрепляет заголовок `Authorization: Bearer <CRON_SECRET>` к каждому вызову по расписанию.
  4. Все вызовы без валидного Bearer токена отклоняются с ответом `401 Unauthorized`.
- **Защита тестового режима**: Вызов тестового режима (`?test=true`) доступен только с валидным `CRON_SECRET` и использует фиксированный защищенный шаблон сообщения.


## Структура проекта

```text
app/                # Маршруты Next.js App Router (погода, каталог /gorod, статьи, API)
components/         # Погодные панели, карта Leaflet, уведомления, карточки
lib/weather/        # Интеграция Open-Meteo, кэширование, геомагнитный индекс, качество воздуха, штормовые предупреждения
lib/notifications/  # Вспомогательные утилиты VAPID для Web Push
lib/rate-limit.ts   # Распределённый Rate Limiting (Upstash Redis)
prisma/             # Схема данных и seed 272 городов России (_chunk_major.json + _chunk_mid1.json)
public/sw.js        # Service Worker для приёма push-уведомлений и кликов по нотификациям
scripts/            # Автоматизированный аудит точности данных (сравнение с Gismeteo / Yandex Weather)
types/              # Типы TypeScript (WeatherBundle, AirQuality, PushSubscription)
```

## Локальный запуск

1. Скопируйте `.env.example` → `.env`, укажите `DATABASE_URL` (Neon PostgreSQL), VAPID ключи и Upstash Redis при необходимости.
2. Установка и запуск базы данных:

```bash
npm install
npx prisma migrate reset
npm run dev
```

`npx prisma migrate reset` очищает БД, применяет миграции и засеивает полный список из **272 городов России (крупные + средние города)** из `prisma/data/`.

**Альтернативный пошаговый запуск**:

```bash
npm run db:migrate
npm run db:seed
```

После этого откройте в браузере [http://localhost:3000](http://localhost:3000) или [http://localhost:3000/pogoda/moscow](http://localhost:3000/pogoda/moscow).

## Маршруты SEO

- `/` — главная страница (поиск, локация, 24 популярных города)
- `/gorod` — полный каталог 272 городов России с группировкой по алфавиту
- `/pogoda/[slug]` — прогноз на сегодня (например `/pogoda/moscow`)
- `/pogoda/[slug]/zavtra` — прогноз на завтра
- `/pogoda/[slug]/3-dnya` | `7-dney` | `10-dney` | `14-dney` — среднесрочный и долгосрочный прогноз
- `/articles` & `/articles/[slug]` — информационные статьи и гиды о погоде

## Аудит точности данных

Обратите внимание: внешние сервисы **Gismeteo** и **Yandex Weather** не являются провайдерами данных в рантайме. Они используются исключительно как сторонние бенчмарки в скриптах аудита точности (`scripts/audit-snapshot.ts` и `scripts/generate-audit-report.ts`), сопоставляющих показатели Open-Meteo с конкурентами. Подробное руководство по обновлению данных бенчмарка см. в [scripts/AUDIT_BENCHMARKS_GUIDE.md](./scripts/AUDIT_BENCHMARKS_GUIDE.md).

## Доступные скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | Запуск dev-сервера Next.js |
| `npm run build` | Сборка production-комплекта |
| `npm run db:migrate` | `prisma migrate dev` (применение миграций) |
| `npm run db:push` | `prisma db push` (синхронизация схемы) |
| `npm run db:setup` | `prisma db push` + `db:seed` |
| `npm run db:seed` | Засеивание 272 городов в PostgreSQL |
| `npm run test` | Запуск тестов Vitest (модульные и интеграционные) |
