import type { MetadataRoute } from "next";
import { ARTICLES } from "./blog/articles";

const base = "https://havenly-2-1.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    priority: 0.8,
  }));

  return [
    { url: `${base}/`,       priority: 1.0 },
    { url: `${base}/about`,  priority: 0.8 },
    { url: `${base}/blog`,   priority: 0.9 },
    { url: `${base}/upgrade`, priority: 0.7 },
    { url: `${base}/privacy`, priority: 0.5 },
    ...blogPosts,
  ];
}
