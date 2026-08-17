"use client";

import Link from "next/link";

function getSeasonalEvent() {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  if (month === 8 && day >= 20 && day <= 31) {
    return {
      title: "День знаний скоро!",
      description: "Проверьте прогноз погоды на 1 сентября в вашем городе",
      icon: "🎒",
      href: "/articles/podgotovka-k-shkole",
    };
  }

  if (month === 9 && day <= 10) {
    return {
      title: "День знаний!",
      description: "Как подготовиться к осенней погоде: советы родителей и учеников",
      icon: "📚",
      href: "/articles",
    };
  }

  if (month === 10 && day >= 1 && day <= 15) {
    return {
      title: "Первый заморозок",
      description: "Подготовьте автомобиль и одежду к первым заморозкам",
      icon: "❄️",
      href: "/articles/podgotovka-avtomobilya-k-pervym-zamarozkam",
    };
  }

  if (month === 12 || month === 1 || month === 2) {
    return {
      title: "Зимний сезон",
      description: "Прогноз погоды на праздники и советы по зимней одежде",
      icon: "⛄",
      href: "/articles",
    };
  }

  if (month === 3 && day >= 1 && day <= 20) {
    return {
      title: "Весенний сезон",
      description: "Как подготовиться к переменчивой весенней погоде",
      icon: "🌱",
      href: "/articles",
    };
  }

  if (month === 5 && day >= 15 && day <= 31) {
    return {
      title: "Белые ночи",
      description: "Погода в Санкт-Петербурге во время Белых ночей",
      icon: "🌅",
      href: "/weather-saint-petersburg",
    };
  }

  if (month === 6 || month === 7) {
    return {
      title: "Летний сезон",
      description: "Прогноз на курорты и советы по защите от солнца",
      icon: "☀️",
      href: "/articles",
    };
  }

  return {
    title: "Погода на дороге",
    description: "Проверьте прогноз перед поездкой — состояние дорог и видимость",
    icon: "🚗",
    href: "/weather-moscow",
  };
}

export function WeatherEventsBanner() {
  const event = getSeasonalEvent();

  return (
    <section className="rounded-2xl bg-gradient-to-r from-sky-50 to-sun-50 p-4 sm:p-5 border border-sky-100 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-start gap-3">
        <span className="text-2xl sm:text-3xl shrink-0">{event.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-sky-950">
            {event.title}
          </h3>
          <p className="mt-0.5 text-xs sm:text-sm text-cloud-600">
            {event.description}
          </p>
        </div>
        <Link
          href={event.href}
          className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-sky-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-800"
        >
          Подробнее
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
