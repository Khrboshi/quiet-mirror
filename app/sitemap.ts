import type { MetadataRoute } from "next";
import { ARTICLES } from "./blog/articles";
import { CONFIG } from "@/app/lib/config";

const base = CONFIG.siteUrl.replace(/\/$/, "");

/**
 * Sitemap configuration for Quiet Mirror
 * 
 * This file generates the sitemap.xml for search engines.
 * It includes:
 * - Main marketing pages
 * - Blog articles with individual priorities
 * - Legal pages (privacy, terms, etc.)
 * 
 * Protected user pages are intentionally excluded as they require authentication.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  
  // Blog posts — using currentDate since your BlogArticle type doesn't have publishedAt/updatedAt
  const blogPosts: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${base}/blog/${article.slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Main marketing pages
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${base}/blog`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/upgrade`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${base}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ];

  return [
    ...mainPages,
    ...blogPosts,
  ];
}
