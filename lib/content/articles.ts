export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
};

const articles: Article[] = [];

export function getLatestArticles(limit: number): Article[] {
  return [...articles]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}
