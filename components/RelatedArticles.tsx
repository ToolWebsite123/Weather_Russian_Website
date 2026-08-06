import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import type { Article } from "@/lib/content/articles";

export function RelatedArticles({
  articles,
  layout = "list",
  showViewAll = false,
}: {
  articles: Article[];
  layout?: "list" | "grid";
  showViewAll?: boolean;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionHeading
        action={
          showViewAll ? (
            <Link
              href="/articles"
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline transition-colors"
            >
              Все статьи &rarr;
            </Link>
          ) : undefined
        }
      >
        Статьи о погоде
      </SectionHeading>
      <ul
        className={
          layout === "grid"
            ? "grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            : "space-y-3"
        }
      >
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="block h-full rounded-xl bg-white/80 p-4 ring-1 ring-sky-100 shadow-xs transition-all duration-150 hover:-translate-y-0.5 hover:bg-sun-50 hover:shadow-md hover:ring-sky-200 motion-reduce:transform-none"
            >
              <p className="text-h3 font-semibold text-sky-950">{article.title}</p>
              <p className="mt-1 text-sm text-cloud-600 line-clamp-2">
                {article.excerpt}
              </p>
              <p className="mt-2 text-xs text-cloud-400">
                {new Date(article.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
