import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { RelatedArticles } from "@/components/RelatedArticles";

export const REGIONAL_SHORTCUTS = [
  { name: "Москва", slug: "moscow", region: "Центр" },
  { name: "Санкт-Петербург", slug: "saint-petersburg", region: "Северо-Запад" },
  { name: "Сочи", slug: "sochi", region: "Юг" },
  { name: "Екатеринбург", slug: "ekaterinburg", region: "Урал" },
  { name: "Новосибирск", slug: "novosibirsk", region: "Сибирь" },
  { name: "Казань", slug: "kazan", region: "Поволжье" },
  { name: "Нижний Новгород", slug: "nizhny-novgorod", region: "Центр" },
  { name: "Краснодар", slug: "krasnodar", region: "Юг" },
  { name: "Владивосток", slug: "vladivostok", region: "Дальний Восток" },
];

const STREAM_CARD_CLASS =
  "rounded-3xl bg-white/95 p-6 border border-sky-200/90 shadow-lg shadow-sky-900/5 backdrop-blur-md ring-1 ring-white/80 space-y-4 transition-all";

export function EnvironmentalInsightsBar() {
  return (
    <div id="environmental-insights" className={STREAM_CARD_CLASS}>
      <div className="flex items-center justify-between border-b border-sky-100/90 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          Экология и геомагнетизм
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
          Окружающая среда · Норма
        </span>
      </div>

      {/* 4-Column Responsive Grid Pattern */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
        {/* Sub-Card 1: Air Quality */}
        <div className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100/90 space-y-1">
          <p className="text-[11px] text-cloud-500 font-semibold uppercase tracking-wider">
            Качество воздуха
          </p>
          <p className="text-base font-bold text-sky-950">24 AQI</p>
          <div className="pt-0.5">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
              🟢 Отличное
            </span>
          </div>
        </div>

        {/* Sub-Card 2: Geomagnetic Field */}
        <div id="geomagnetic" className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100/90 space-y-1">
          <p className="text-[11px] text-cloud-500 font-semibold uppercase tracking-wider">
            Геомагнитное поле
          </p>
          <p className="text-base font-bold text-sky-950">2 Kp</p>
          <div className="pt-0.5">
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/80">
              🟡 Спокойное
            </span>
          </div>
        </div>

        {/* Sub-Card 3: Road Conditions */}
        <div id="road-conditions" className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100/90 space-y-1">
          <p className="text-[11px] text-cloud-500 font-semibold uppercase tracking-wider">
            Состояние дорог
          </p>
          <p className="text-base font-bold text-sky-950 flex items-center gap-1">
            <span>🚗</span>
            <span>Сухо</span>
          </p>
          <div className="pt-0.5">
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
              🟢 Безопасно
            </span>
          </div>
        </div>

        {/* Sub-Card 4: Solar UV & Moon Phase */}
        <div className="rounded-2xl bg-sky-50/70 p-3.5 border border-sky-100/90 space-y-1">
          <p className="text-[11px] text-cloud-500 font-semibold uppercase tracking-wider">
            УФ & Луна
          </p>
          <p className="text-xs font-bold text-sky-950">☀️ УФ: 2 (Низкий)</p>
          <p className="text-[11px] font-medium text-cloud-600">🌙 Растущая</p>
        </div>
      </div>
    </div>
  );
}

export function RegionalShortcutsBar() {
  return (
    <div className={STREAM_CARD_CLASS}>
      <div className="flex items-center justify-between border-b border-sky-100/90 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky-600 shrink-0" />
          Быстрый переход по регионам
        </h3>
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100/90 px-2.5 py-0.5 rounded-full border border-sky-200/80">
          Россия
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {REGIONAL_SHORTCUTS.map((item) => (
          <Link
            key={item.slug}
            href={`/pogoda/${item.slug}`}
            className="rounded-xl bg-sky-50/80 px-3.5 py-2 text-xs font-bold text-sky-900 border border-sky-200/70 hover:bg-sky-600 hover:text-white hover:border-sky-600 transition-all duration-150 shadow-2xs active:scale-95 text-center flex-1 min-w-[7.5rem]"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PortalSidebar({ articles }: { articles?: Article[] }) {
  return (
    <aside className="space-y-6 sm:space-y-8">
      <EnvironmentalInsightsBar />
      <RegionalShortcutsBar />
      {articles && articles.length > 0 && <RelatedArticles articles={articles} />}
    </aside>
  );
}
