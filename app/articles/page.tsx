import type { Metadata } from "next";
import Link from "next/link";
import { getAllArticles, CATEGORY_LABELS } from "@/lib/content/articles";
import { PageShell } from "@/components/SiteChrome";
import { getFavoritesForSession } from "@/lib/weather/city-page";

export const metadata: Metadata = {
  title: "Статьи о погоде и климате — Полезные материалы | WeatherHub",
  description: "Экспертные статьи о метеочувствительности, УФ-индексе, правильной экипировке и особенностях климата в регионах России.",
};

export default async function ArticlesIndexPage() {
  const articles = getAllArticles();
  const favorites = await getFavoritesForSession().catch(() => []);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <nav className="text-sm text-cloud-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <span className="text-cloud-800 font-medium">Статьи</span>
        </nav>

        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-sky-950">
            Статьи о погоде, климате и здоровье
          </h1>
          <p className="mt-2 text-sm sm:text-base text-cloud-600">
            Полезные гиды и советы экспертов для комфортной жизни в любую погоду.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-sky-100 bg-white p-5 shadow-sm ring-1 ring-sky-100/50 transition-all hover:border-sky-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-600/20">
                    {CATEGORY_LABELS[article.category]}
                  </span>
                  <time className="text-xs text-cloud-400">
                    {new Date(article.publishedAt).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h2 className="text-lg font-semibold text-cloud-900 group-hover:text-sky-600 transition-colors">
                  {article.title}
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-cloud-600 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="mt-4 flex items-center text-xs font-medium text-sky-600 group-hover:translate-x-1 transition-transform">
                Читать статью →
              </div>
            </Link>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
