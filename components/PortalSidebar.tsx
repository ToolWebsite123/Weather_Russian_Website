import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { SectionHeading } from "@/components/SectionHeading";

const REGIONAL_SHORTCUTS = [
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

export function PortalSidebar({ articles }: { articles: Article[] }) {
  return (
    <aside className="space-y-6">
      {/* Environmental Insights & Geomagnetic Panel */}
      <div id="environmental-insights" className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100/80 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Экология и геомагнетизм
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Норма
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-sky-50/70 p-3 border border-sky-100/80 space-y-1">
            <p className="text-[11px] text-cloud-500 font-medium">Качество воздуха</p>
            <p className="text-base font-bold text-sky-950">24 AQI</p>
            <p className="text-[10px] text-emerald-600 font-semibold">🟢 Отличное</p>
          </div>

          <div id="geomagnetic" className="rounded-xl bg-amber-50/60 p-3 border border-amber-100/80 space-y-1">
            <p className="text-[11px] text-amber-900 font-medium">Геомагнитное поле</p>
            <p className="text-base font-bold text-amber-950">2 Kp</p>
            <p className="text-[10px] text-amber-700 font-semibold">🟡 Спокойное</p>
          </div>
        </div>

        <div id="road-conditions" className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>🚗 Состояние дорог</span>
            <span className="text-emerald-700 text-[11px]">Сухо & Безопасно</span>
          </div>
          <p className="text-[11px] text-slate-500">Видимость отличная, гололедица отсутствует.</p>
        </div>

        <div className="flex items-center justify-between text-xs text-cloud-600 pt-1">
          <span className="flex items-center gap-1.5">
            <span>☀️ УФ-индекс:</span>
            <strong className="text-sky-950 font-semibold">2 (Низкий)</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span>🌙 Фаза Луны:</span>
            <strong className="text-sky-950 font-semibold">Растущая</strong>
          </span>
        </div>
      </div>

      {/* Real-time Weather News & Articles Feed */}
      <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur space-y-4">
        <SectionHeading
          action={
            <Link
              href="/articles"
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 transition-colors"
            >
              Все новости &rarr;
            </Link>
          }
        >
          Лента новостей
        </SectionHeading>

        <ul className="divide-y divide-sky-100/80 space-y-3">
          {articles.map((article) => (
            <li key={article.slug} className="pt-3 first:pt-0">
              <Link
                href={`/articles/${article.slug}`}
                className="group block space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-cloud-400">
                  <span className="font-semibold text-sky-700 uppercase tracking-wider text-[10px] bg-sky-50 px-1.5 py-0.5 rounded">
                    Прогноз & Анализ
                  </span>
                  <span>{new Date(article.publishedAt).toLocaleDateString("ru-RU")}</span>
                </div>
                <h4 className="text-xs font-bold text-sky-950 leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-[11px] text-cloud-500 line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Regional Shortcuts Navigation */}
      <div className="rounded-2xl bg-white/80 p-5 ring-1 ring-sky-100 shadow-sm backdrop-blur space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-sky-950">
          Быстрый переход по регионам
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {REGIONAL_SHORTCUTS.map((item) => (
            <Link
              key={item.slug}
              href={`/pogoda/${item.slug}`}
              className="rounded-lg bg-sky-50/80 px-2.5 py-1.5 text-xs font-medium text-sky-900 ring-1 ring-sky-200/60 hover:bg-sky-600 hover:text-white hover:ring-sky-600 transition-all"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
