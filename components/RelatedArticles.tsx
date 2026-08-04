import Link from "next/link";
import type { Article } from "@/lib/content/articles";

export function RelatedArticles({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 font-serif text-xl text-sky-950">Статьи о погоде</h2>
      <ul className="space-y-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={`/articles/${article.slug}`}
              className="block rounded-xl bg-white/80 p-4 ring-1 ring-sky-100 hover:bg-sun-50"
            >
              <p className="font-medium text-sky-950">{article.title}</p>
              <p className="mt-1 text-sm text-cloud-600">{article.excerpt}</p>
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
