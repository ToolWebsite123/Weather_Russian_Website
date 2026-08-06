import Link from "next/link";
import { ru } from "@/lib/i18n/ru";

export function SiteHeader({
  favorites = [],
}: {
  favorites?: { slug: string; name: string }[];
}) {
  return (
    <header className="relative z-10 border-b border-sky-200/50 bg-white/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-serif text-h2 font-semibold text-sky-950">
            {ru.brand}
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/gorod"
              className="text-xs font-semibold uppercase tracking-wider text-sky-900 hover:text-sky-700 transition-colors"
            >
              Все города
            </Link>
            <Link
              href="/articles"
              className="text-xs font-semibold uppercase tracking-wider text-cloud-600 hover:text-sky-800 transition-colors hidden sm:inline-block"
            >
              Статьи
            </Link>
          </nav>
        </div>

        {favorites.length > 0 && (
          <nav className="hidden items-center gap-3 md:flex" aria-label={ru.favorites}>
            <span className="text-xs uppercase tracking-wide text-cloud-500">
              {ru.favorites}
            </span>
            {favorites.map((f) => (
              <Link
                key={f.slug}
                href={`/pogoda/${f.slug}`}
                className="text-sm text-sky-800 hover:text-sun-600"
              >
                {f.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
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
