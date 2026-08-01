# WeatherHub

Прогноз погоды (Россия и мир): Next.js 14, TypeScript, Tailwind, Prisma, Neon PostgreSQL, Open-Meteo.

## Stack

- Next.js 14 App Router + TypeScript (strict)
- Tailwind (sky / sun / cloud palette)
- Prisma + Neon Postgres (города, кэш прогноза, избранное)
- Open-Meteo (основной API) + опционально Yandex Weather

## Структура

```text
app/                # маршруты и API
components/         # UI
lib/weather/        # Open-Meteo, кэш, Yandex
lib/i18n/ru.ts      # русские строки
prisma/             # схема и seed городов
types/              # типы погоды
```

## Локальный запуск

1. Скопируйте `.env.example` → `.env`, укажите `DATABASE_URL` (Neon).
2. Опционально: `WEATHER_API_KEY`, `YANDEX_WEATHER_API_KEY`.
3. Установка и БД:

```bash
npm install
npx prisma migrate reset
npm run dev
```

`migrate reset` drops the database, applies migrations, and runs the seed (20 major Russian cities).

**Or step-by-step** (after schema changes):

```bash
npm run db:migrate
# name when prompted: city_tier_schema
npx prisma db seed
# equivalent: npm run db:seed
```

If migrate fails because `City.id` changed from String to Int on an existing Neon DB, run once:

```bash
npx prisma migrate reset
```

Then open e.g. [http://localhost:3000/pogoda/moscow](http://localhost:3000/pogoda/moscow).

## Маршруты SEO

- `/` — поиск и популярные города
- `/pogoda/[slug]` — сегодня (например `/pogoda/moscow`)
- `/pogoda/[slug]/zavtra` — завтра
- `/pogoda/[slug]/3-dnya` | `7-dney` | `10-dney` | `14-dney`

## Скрипты

| Команда | Описание |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | production build |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (no migration history) |
| `npm run db:setup` | `prisma db push` + seed |
| `npm run db:seed` | только seed городов |
