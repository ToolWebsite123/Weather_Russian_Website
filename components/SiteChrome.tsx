"use client";

import { useState } from "react";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
import { CitySearch } from "@/components/CitySearch";

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

  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/50 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-h2 font-semibold text-sky-950 hover:text-sky-800 transition-colors shrink-0"
          >
            <SunCloudLogo />
            <span>{ru.brand}</span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/gorod"
              className="text-xs font-semibold uppercase tracking-wider text-sky-900 hover:text-sky-700 transition-colors whitespace-nowrap"
            >
              Все города
            </Link>
            <Link
              href="/articles"
              className="text-xs font-semibold uppercase tracking-wider text-cloud-600 hover:text-sky-800 transition-colors hidden sm:inline-block whitespace-nowrap"
            >
              Статьи
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {favorites.length > 0 && (
            <nav className="hidden items-center gap-3 lg:flex" aria-label={ru.favorites}>
              <span className="text-xs uppercase tracking-wide text-cloud-500">
                {ru.favorites}
              </span>
              {favorites.map((f) => (
                <Link
                  key={f.slug}
                  href={`/pogoda/${f.slug}`}
                  className="text-sm text-sky-800 hover:text-sun-600 truncate max-w-[100px]"
                >
                  {f.name}
                </Link>
              ))}
            </nav>
          )}

          <button
            type="button"
            onClick={handleSearchClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200/70 bg-sky-50/80 text-sky-900 shadow-sm transition hover:bg-sky-100 hover:text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Поиск города"
            title="Поиск города"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-sky-100/80 bg-white/95 px-4 py-3 shadow-inner sm:px-6">
          <div className="mx-auto max-w-5xl flex justify-center">
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
