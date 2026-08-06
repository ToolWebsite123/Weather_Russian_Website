import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug, getAllArticles, CATEGORY_LABELS } from "@/lib/content/articles";
import { PageShell } from "@/components/SiteChrome";
import { getFavoritesForSession } from "@/lib/weather/city-page";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: "Статья не найдена | WeatherHub" };

  return {
    title: `${article.title} | WeatherHub`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
    },
  };
}

/**
 * Simple React renderer for article markdown content.
 */
function ArticleBodyRenderer({ content }: { content: string }) {
  const lines = content.trim().split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 list-disc space-y-2 pl-6 text-cloud-700">
          {listItems.map((item, idx) => {
            const formatted = item.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return (
              <li
                key={idx}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      // Skip main title as it's rendered in header
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mt-8 mb-4 font-serif text-h2 text-sky-950 font-semibold">
          {trimmed.replace("## ", "")}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mt-6 mb-3 text-h3 font-semibold text-cloud-900">
          {trimmed.replace("### ", "")}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.replace("- ", ""));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    flushList();

    const formattedParagraph = trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    elements.push(
      <p
        key={index}
        className="my-3 text-sm sm:text-base leading-relaxed text-cloud-700"
        dangerouslySetInnerHTML={{ __html: formattedParagraph }}
      />
    );
  });

  flushList();

  return <div className="prose prose-sky max-w-none">{elements}</div>;
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const favorites = await getFavoritesForSession().catch(() => []);

  return (
    <PageShell favorites={favorites}>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
        <nav className="text-sm text-cloud-500">
          <Link href="/" className="hover:text-sky-600 transition-colors">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="hover:text-sky-600 transition-colors">
            Статьи
          </Link>
          <span className="mx-2">/</span>
          <span className="text-cloud-800 font-medium line-clamp-1 inline-block max-w-[200px] sm:max-w-xs align-bottom">
            {article.title}
          </span>
        </nav>

        <article className="rounded-2xl border border-sky-100 bg-white p-6 sm:p-10 shadow-sm ring-1 ring-sky-100/50">
          <header className="border-b border-cloud-100 pb-6 mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 ring-1 ring-inset ring-sky-600/20">
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

            <h1 className="font-serif text-h1 font-bold text-sky-950">
              {article.title}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-cloud-600 leading-relaxed font-light">
              {article.excerpt}
            </p>
          </header>

          <ArticleBodyRenderer content={article.body} />

          <footer className="mt-10 border-t border-cloud-100 pt-6 flex justify-between items-center">
            <Link
              href="/articles"
              className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
            >
              ← Все статьи
            </Link>
          </footer>
        </article>
      </main>
    </PageShell>
  );
}
