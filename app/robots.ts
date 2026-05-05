/**
 * app/robots.ts
 *
 * Generates robots.txt — allows all crawlers on public pages
 * and disallows indexing of authenticated/private routes.
 */
import type { MetadataRoute } from "next";
import { CONFIG } from "@/app/lib/config";

const base = CONFIG.siteUrl.replace(/\/$/, "");

/**
 * robots.txt configuration for Quiet Mirror
 * 
 * This file controls how search engines crawl and index the site.
 * Key principles:
 * - Public marketing pages: allowed
 * - Protected user data pages: disallowed
 * - API endpoints: disallowed
 * - Magic login page: disallowed (prevents indexing of login page)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // /insights/preview is a public marketing page — must stay crawlable.
      // The explicit allow must appear before the blanket /insights disallow.
      allow: ["/", "/insights/preview"],
      disallow: [
        // Protected user routes (require authentication)
        "/dashboard",
        "/journal",
        "/settings",
        "/tools",
        "/insights",
        
        // API routes (should never be indexed)
        "/api",
        
        // Authentication pages (no SEO value)
        "/magic-login",
        "/auth",
        "/signin",
        "/signup",
        
        // Hidden system routes
        "/*/edit$",      // Prevent indexing of edit pages
        "/*/delete$",    // Prevent indexing of delete actions
        "/_next",        // Next.js internal files
        "/static/media", // Static media files
      ],
    },
    // Optional: Add separate rules for specific bots if needed
    // {
    //   userAgent: "Googlebot",
    //   allow: "/",
    //   disallow: ["/api/", "/dashboard/"],
    // },
    sitemap: `${base}/sitemap.xml`,
    // Add host for better SEO (optional, but recommended for multi-domain setups)
    host: base,
  };
}
