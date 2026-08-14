"use client";

import Link from "next/link";
import { getLatestArticles, CATEGORY_LABELS } from "@/lib/content/articles";

export function NewsSection() {
  const articles = getLatestArticles(5);

  if (articles.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-xs text-slate-900 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Новости и статьи о погоде
        </h2>
        <Link
          href="/articles"
          className="text-xs font-medium text-sky-800 hover:text-sky-950 transition-colors"
        >
          Все статьи →
        </Link>
      </div>

      <div className="space-y-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-sky-50/60"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-800 ring-1 ring-inset ring-sky-600/20">
                  {CATEGORY_LABELS[article.category]}
                </span>
                <time className="text-[10px] text-cloud-400">
                  {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
              </div>
              <h3 className="text-sm font-semibold text-sky-950 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h3>
              <p className="mt-1 text-xs text-cloud-600 line-clamp-2 leading-relaxed">
                {article.excerpt}
              </p>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-sky-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all mt-1"
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
        ))}
      </div>
    </section>
  );
}
