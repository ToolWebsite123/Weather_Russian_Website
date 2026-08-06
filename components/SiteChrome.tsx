"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ru } from "@/lib/i18n/ru";
import { CitySearch } from "@/components/CitySearch";
import { AutoLocationDetector } from "@/components/AutoLocationDetector";

function SunCloudLogo() {
  return (
    <svg
      className="h-7 w-7 shrink-0"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="21" cy="11" r="5" className="fill-sun-500" />
      <path
        d="M21 3v2M21 17v2M29 11h-2M15 11h-2M26.657 5.343l-1.414 1.414M16.757 15.243l-1.414 1.414"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-sun-500"
      />
      <path
        d="M8 24h15a5 5 0 001.6-9.74 6 6 0 00-11.2-1.92A4.5 4.5 0 008 24z"
        className="fill-sky-500"
      />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SiteHeader({
  favorites = [],
}: {
  favorites?: { slug: string; name: string }[];
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname() || "/";

  // Parse current city slug and sub-route dynamically from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentCitySlug = pathSegments[0] === "pogoda" && pathSegments[1] ? pathSegments[1] : "moscow";
  const subRoute = pathSegments[0] === "pogoda" ? (pathSegments[2] || "") : "";

  function handleSearchClick() {
    const pageSearchInput = document.querySelector<HTMLInputElement>(
      `input[aria-label="${ru.searchPlaceholder}"], input[placeholder="${ru.searchPlaceholder}"]`
    );
    if (pageSearchInput && !isSearchOpen) {
      pageSearchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      pageSearchInput.focus();
    } else {
      setIsSearchOpen((prev) => !prev);
    }
  }

  const horizonTabs = [
    { id: "yesterday", label: "Вчера", href: `/pogoda/${currentCitySlug}?view=yesterday#hourly-forecast`, active: false },
    { id: "now", label: "Сейчас", href: `/pogoda/${currentCitySlug}`, active: subRoute === "" && (pathname.startsWith("/pogoda") || pathname === "/") },
    { id: "today", label: "Сегодня", href: `/pogoda/${currentCitySlug}`, active: false },
    { id: "tomorrow", label: "Завтра", href: `/pogoda/${currentCitySlug}/zavtra`, active: subRoute === "zavtra" },
    { id: "3days", label: "3 дня", href: `/pogoda/${currentCitySlug}/3-dnya`, active: subRoute === "3-dnya" },
    { id: "weekend", label: "Выходные", href: `/pogoda/${currentCitySlug}/vykhodnye`, active: subRoute === "vykhodnye" },
    { id: "week", label: "Неделя", href: `/pogoda/${currentCitySlug}/7-dney`, active: subRoute === "7-dney" },
    { id: "10days", label: "10 дней", href: `/pogoda/${currentCitySlug}/10-dney`, active: subRoute === "10-dney" },
    { id: "2weeks", label: "2 недели", href: `/pogoda/${currentCitySlug}/14-dney`, active: subRoute === "14-dney" },
    { id: "knowledge", label: "День знаний", href: `/pogoda/${currentCitySlug}#seasonal`, active: false },
    { id: "month", label: "Месяц", href: `/pogoda/${currentCitySlug}/14-dney`, active: false },
    { id: "radar", label: "Радар", href: "#weather-map", active: false },
    { id: "pollen", label: "Пыльца", href: "#environmental-insights", active: false },
    { id: "roads", label: "Дороги", href: "#road-conditions", active: false },
    { id: "gm", label: "Г/м активность", href: "#geomagnetic", active: false },
    { id: "archive", label: "Архив", href: "/articles", active: pathname.startsWith("/articles") },
  ];

  function scrollNav(direction: "left" | "right") {
    const container = document.getElementById("horizon-nav-container");
    if (container) {
      const amount = direction === "left" ? -240 : 240;
      container.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Top Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-h2 font-semibold text-sky-950 hover:text-sky-800 transition-colors shrink-0"
          >
            <SunCloudLogo />
            <span>{ru.brand}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/gorod"
              className="text-xs font-semibold uppercase tracking-wider text-sky-900 hover:text-sky-700 transition-colors whitespace-nowrap"
            >
              Все 272 города
            </Link>
            <Link
              href="/articles"
              className="text-xs font-semibold uppercase tracking-wider text-cloud-600 hover:text-sky-800 transition-colors whitespace-nowrap"
            >
              Статьи
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {favorites.length > 0 && (
            <nav className="hidden items-center gap-2 lg:flex" aria-label={ru.favorites}>
              <span className="text-xs uppercase tracking-wide text-cloud-500 font-medium">
                {ru.favorites}:
              </span>
              {favorites.map((f) => (
                <Link
                  key={f.slug}
                  href={`/pogoda/${f.slug}`}
                  className="rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 hover:bg-sky-100 hover:text-sky-950 transition-colors truncate max-w-[110px]"
                >
                  {f.name}
                </Link>
              ))}
            </nav>
          )}

          <button
            type="button"
            onClick={handleSearchClick}
            className="flex h-9 items-center gap-2 rounded-xl border border-sky-200/80 bg-sky-50/80 px-3 text-xs font-semibold text-sky-900 shadow-2xs transition hover:bg-sky-100 hover:text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Поиск города"
            title="Поиск города"
          >
            <SearchIcon className="h-4 w-4 text-sky-700" />
            <span className="hidden sm:inline">Поиск города...</span>
          </button>
        </div>
      </div>

      {/* Sub-Header Horizon Quick Navigation Strip with Scroll Arrows */}
      <div className="relative border-t border-sky-200/80 bg-sky-600 px-2 py-1.5 sm:px-4 shadow-inner">
        <div className="mx-auto flex max-w-7xl items-center gap-1">
          <button
            type="button"
            onClick={() => scrollNav("left")}
            className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-700/80 text-white hover:bg-sky-800 transition-colors"
            aria-label="Скролл влево"
          >
            ‹
          </button>

          <div
            id="horizon-nav-container"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="flex flex-1 items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth text-xs text-white"
          >
            {horizonTabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`shrink-0 rounded-md px-3 py-1.5 font-medium transition-all whitespace-nowrap ${
                  tab.active
                    ? "bg-sky-100 text-sky-950 font-bold shadow-xs"
                    : "text-sky-50 hover:bg-sky-500/80 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollNav("right")}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-500 text-white hover:bg-sky-400 transition-colors shadow-xs font-bold"
            aria-label="Скролл вправо"
          >
            ›
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-sky-100/80 bg-white/95 px-4 py-3 shadow-inner sm:px-6">
          <div className="mx-auto max-w-4xl flex justify-center">
            <CitySearch />
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-sky-200/40 py-8 text-center text-sm text-cloud-500 space-y-3">
      <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-sky-900">
        <Link href="/" className="hover:underline">
          Главная
        </Link>
        <span>·</span>
        <Link href="/gorod" className="hover:underline">
          Каталог всех 272 городов
        </Link>
        <span>·</span>
        <Link href="/articles" className="hover:underline">
          Статьи и гайды
        </Link>
        <span>·</span>
        <Link href="/terms" className="hover:underline">
          Условия
        </Link>
        <span>·</span>
        <Link href="/privacy" className="hover:underline">
          Конфиденциальность
        </Link>
        <span>·</span>
        <Link href="/contact" className="hover:underline">
          Контакты
        </Link>
      </nav>
      <p className="text-xs text-cloud-500">
        Данные о погоде предоставлены{" "}
        <a
          href="https://open-meteo.com/"
          className="underline decoration-sky-300 underline-offset-2 hover:text-sky-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open-Meteo
        </a>
      </p>
      <p className="text-xs text-cloud-400">
        WeatherHub · точный прогноз погоды без рекламного шума
      </p>
    </footer>
  );
}
export function PageShell({
  children,
  favorites,
}: {
  children: React.ReactNode;
  favorites?: { slug: string; name: string }[];
}) {
  return (
    <div className="relative min-h-screen">
      <AutoLocationDetector />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,theme(colors.sun.200)_0%,transparent_40%),radial-gradient(ellipse_at_90%_5%,theme(colors.sky.300)_0%,transparent_45%),linear-gradient(180deg,theme(colors.sky.50)_0%,theme(colors.sky.100)_50%,theme(colors.cloud.50)_100%)]"
      />
      <SiteHeader favorites={favorites} />
      <div className="relative z-10">{children}</div>
      <SiteFooter />
    </div>
  );
}
