"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ru } from "@/lib/i18n/ru";
import { CitySearch } from "@/components/CitySearch";

import { useUnit } from "@/components/UnitContext";
import { AppInstallModal } from "@/components/AppInstallModal";

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
  cityCount?: number;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; slug: string; name: string; admin1?: string; country?: string }[]>([]);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const { unit, toggleUnit } = useUnit();
  const pathname = usePathname() || "/";
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Parse current city slug dynamically from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentCitySlug = pathSegments[0] === "pogoda" && pathSegments[1] ? pathSegments[1] : "moscow";

  const isCityPage = pathname.startsWith("/pogoda");
  const anchorPrefix = isCityPage ? "" : `/pogoda/${currentCitySlug}`;

  function handleSearchClick() {
    const pageSearchInput = document.querySelector<HTMLInputElement>(
      'input[placeholder*="Поиск по 272"], input[placeholder*="Поиск города"]',
    );
    if (pageSearchInput && !isSearchOpen) {
      pageSearchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      pageSearchInput.focus();
    } else {
      setIsSearchOpen((prev) => !prev);
    }
  }

  // Handle live geocoding search inside inline navbar search input
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside listener to close search / favorites dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Single-Row Navbar Header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-h2 font-semibold text-sky-950 hover:text-sky-800 transition-colors shrink-0"
          >
            <SunCloudLogo />
            <span>{ru.brand}</span>
          </Link>

          {/* Center-Left 3 Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-sky-900">
            <Link href="/" className="hover:text-sky-600 transition-colors">
              Погода
            </Link>
            <Link href="/articles" className="hover:text-sky-600 transition-colors">
              Статьи
            </Link>
            <Link href={`${anchorPrefix}#weather-map`} className="hover:text-sky-600 transition-colors">
              Карта
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Expandable Inline Search Input */}
          <div ref={searchBoxRef} className="relative flex items-center">
            <div
              className={`flex h-9 items-center rounded-xl border border-sky-200/80 bg-sky-50/80 transition-all duration-300 ease-in-out ${
                isSearchOpen
                  ? "w-48 sm:w-[220px] bg-white ring-2 ring-sky-300 px-2.5 shadow-xs"
                  : "w-9 justify-center cursor-pointer hover:bg-sky-100"
              }`}
            >
              <button
                type="button"
                onClick={handleSearchClick}
                className="flex items-center justify-center shrink-0 text-sky-700 hover:text-sky-950 focus:outline-none"
                aria-label="Поиск города"
                title="Поиск города"
              >
                <SearchIcon className="h-4 w-4" />
              </button>
              {isSearchOpen && (
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск города..."
                  className="w-full bg-transparent ml-2 text-xs font-medium text-sky-950 outline-none placeholder:text-cloud-400"
                />
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-xl border border-sky-100 bg-white py-1.5 shadow-xl z-50 max-h-64 overflow-y-auto">
                {searchResults.map((r) => (
                  <Link
                    key={`${r.id}-${r.slug}`}
                    href={`/pogoda/${r.slug}`}
                    className="block px-3 py-2 text-left hover:bg-sky-50 transition-colors"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                  >
                    <div className="text-xs font-semibold text-sky-950">{r.name}</div>
                    <div className="text-[11px] text-cloud-500">
                      {[r.admin1, r.country].filter(Boolean).join(", ")}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Temperature Unit Switcher (°C / °F) */}
          <button
            type="button"
            onClick={toggleUnit}
            className="flex items-center justify-center h-9 rounded-xl bg-sky-100/80 px-2.5 text-xs font-bold text-sky-900 hover:bg-sky-200 transition-colors"
            title="Переключить единицу измерения температуры"
          >
            °{unit}
          </button>

          {/* Favorites Dropdown Pill */}
          {favorites.length > 0 && (
            <div className="relative" onMouseLeave={() => setIsFavOpen(false)}>
              <button
                type="button"
                onClick={() => setIsFavOpen((prev) => !prev)}
                onMouseEnter={() => setIsFavOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80 px-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                aria-label="Избранное"
              >
                <span>⭐</span>
                <span>{favorites.length}</span>
              </button>

              {isFavOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-sky-100 bg-white p-1.5 shadow-lg z-50">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-cloud-400 uppercase tracking-wider">
                    {ru.favorites}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {favorites.map((f) => (
                      <Link
                        key={f.slug}
                        href={`/pogoda/${f.slug}`}
                        className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-sky-950 hover:bg-sky-50 transition-colors truncate"
                        onClick={() => setIsFavOpen(false)}
                      >
                        {f.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ cityCount = 272 }: { cityCount?: number }) {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);

  return (
    <>
      <footer className="relative z-10 border-t border-sky-200/40 py-8 text-center text-sm text-cloud-500 space-y-3">
        <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-sky-900">
          <Link href="/" className="hover:underline">
            Главная
          </Link>
          <span>·</span>
          <Link href="/gorod" className="hover:underline">
            Каталог всех {cityCount} городов
          </Link>
          <span>·</span>
          <Link href="/articles" className="hover:underline">
            Статьи и гайды
          </Link>
          <span>·</span>
          <button
            type="button"
            onClick={() => setIsAppModalOpen(true)}
            className="hover:underline cursor-pointer font-medium text-sky-900"
          >
            Приложения
          </button>
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
      <AppInstallModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </>
  );
}

export function PageShell({
  children,
  favorites,
  cityCount = 272,
}: {
  children: React.ReactNode;
  favorites?: { slug: string; name: string }[];
  cityCount?: number;
}) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,theme(colors.sun.200)_0%,transparent_40%),radial-gradient(ellipse_at_90%_5%,theme(colors.sky.300)_0%,transparent_45%),linear-gradient(180deg,theme(colors.sky.50)_0%,theme(colors.sky.100)_50%,theme(colors.cloud.50)_100%)]"
      />
      <SiteHeader favorites={favorites} cityCount={cityCount} />
      <div className="relative z-10">{children}</div>
      <SiteFooter cityCount={cityCount} />
    </div>
  );
}

