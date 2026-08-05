import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { getAllArticles } from "@/lib/content/articles";
import { prisma } from "@/lib/prisma";
import { getAllStaticCities } from "@/lib/weather/static-cities";

const FORECAST_TABS = [
  "",
  "/zavtra",
  "/3-dnya",
  "/7-dney",
  "/10-dney",
  "/14-dney",
] as const;

async function getSitemapCities(): Promise<Array<{ slug: string }>> {
  try {
    const cities = await prisma.city.findMany({
      select: { slug: true },
      orderBy: { id: "asc" },
    });
    if (cities.length > 0) return cities;
  } catch {
    // Database query failed, fall back to static city dataset
  }
  return getAllStaticCities().map((c) => ({ slug: c.slug }));
}

/**
 * Note on scale: Next.js sitemap functions have a soft limit of 50,000 URLs per file.
 * Current URL count is ~1,640 (272 cities * 6 routes + 6 articles + homepage + articles index).
 * If the city count or route variants grow substantially in the future (e.g. > 8,000 cities),
 * generateSitemaps() should be used to paginate sitemap index files.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = config.siteUrl;
  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gorod`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Article detail pages
  const articles = getAllArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // City forecast base pages and tab variants
  const cities = await getSitemapCities();
  const cityRoutes: MetadataRoute.Sitemap = [];

  for (const city of cities) {
    for (const tab of FORECAST_TABS) {
      cityRoutes.push({
        url: `${baseUrl}/pogoda/${city.slug}${tab}`,
        lastModified: now,
        changeFrequency: "hourly",
        priority: tab === "" ? 0.9 : 0.8,
      });
    }
  }

  return [...staticRoutes, ...articleRoutes, ...cityRoutes];
}
