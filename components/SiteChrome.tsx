"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ru } from "@/lib/i18n/ru";
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

function MenuIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SiteHeader({
  favorites = [],
}: {
  favorites?: { slug: string; name: string }[];
  cityCount?: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: number; slug: string; name: string; admin1?: string; country?: string }[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isFavOpen, setIsFavOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unit, toggleUnit } = useUnit();
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle live geocoding search inside navbar search input
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

  // Click outside listener to close search / favorites / mobile menu dropdowns
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard listener for Escape key to close mobile menu
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  // Auto-close mobile menu on desktop resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Focus trap / focus first element in mobile menu when opened
  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const focusables = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }
  }, [isMobileMenuOpen]);

  function handleMobileMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab" && mobileMenuRef.current) {
      const focusables = Array.from(
        mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Top Navbar Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-6 shrink-0 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-serif text-h2 font-semibold text-sky-950 hover:text-sky-800 transition-colors shrink-0"
          >
            <SunCloudLogo />
            <span className="hidden sm:inline">{ru.brand}</span>
          </Link>

          {/* Prominent Always-Visible Search Input */}
          <div ref={searchBoxRef} className="relative flex items-center min-w-0">
            <div className="flex h-9 w-36 sm:w-64 md:w-80 items-center rounded-xl border border-sky-200 bg-sky-50/90 px-2.5 transition-all focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-200 shadow-xs">
              <SearchIcon className="h-4 w-4 shrink-0 text-sky-600" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent ml-1.5 text-xs sm:text-sm font-medium text-sky-950 outline-none placeholder:text-sky-400 truncate"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-sky-400 hover:text-sky-700 ml-1 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-80 rounded-xl border border-sky-100 bg-white py-1.5 shadow-xl z-50 max-h-72 overflow-y-auto">
                {searchResults.map((r) => (
                  <Link
                    key={`${r.id}-${r.slug}`}
                    href={`/pogoda/${r.slug}`}
                    className="block px-3 py-2 text-left hover:bg-sky-50 transition-colors"
                    onClick={() => {
                      setIsSearchFocused(false);
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
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-sky-900">
            <Link href="/articles" className="hover:text-sky-600 transition-colors">
              Статьи
            </Link>
            <Link href="/gorod" className="hover:text-sky-600 transition-colors">
              Все города
            </Link>
          </nav>

          {/* Temperature Unit Switcher (°C / °F) */}
          <button
            type="button"
            onClick={toggleUnit}
            className="flex items-center justify-center h-8 sm:h-9 rounded-xl bg-sky-100/90 border border-sky-200/80 px-2 text-xs font-bold text-sky-900 hover:bg-sky-200 transition-colors cursor-pointer"
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
                className="flex h-8 sm:h-9 items-center gap-1 rounded-xl bg-amber-50/90 border border-amber-200/80 px-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
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

          {/* Mobile Hamburger Toggle Button (lg:hidden) */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-colors lg:hidden shrink-0 cursor-pointer shadow-xs"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMobileMenuOpen ? (
              <CloseIcon className="h-4 sm:h-5 w-4 sm:w-5" />
            ) : (
              <MenuIcon className="h-4 sm:h-5 w-4 sm:w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation Panel */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          onKeyDown={handleMobileMenuKeyDown}
          className="lg:hidden border-t border-sky-200/60 bg-white/95 backdrop-blur-md px-3 py-3 shadow-md transition-all"
        >
          <div className="mx-auto max-w-7xl space-y-2">
            <div className="flex items-center justify-between border-b border-sky-100 pb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cloud-400">
                Навигация
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-sky-700 hover:bg-sky-50 transition-colors"
                aria-label="Закрыть меню"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex flex-col space-y-1">
              <Link
                href="/articles"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-sky-950 hover:bg-sky-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Статьи</span>
                <span className="text-xs font-normal text-sky-600">→</span>
              </Link>
              <Link
                href="/gorod"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-sky-950 hover:bg-sky-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>Все города</span>
                <span className="text-xs font-normal text-sky-600">→</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter({}: { cityCount?: number } = {}) {
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
            Каталог городов России и мира
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
