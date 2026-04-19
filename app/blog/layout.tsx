// app/blog/layout.tsx
// Server component — exports SEO metadata for the blog page.
// blog/page.tsx is a client component (needs useTranslation) so metadata
// lives here in the layout, following the same pattern as app/about/layout.tsx.

import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title:       t.blogPage.metaTitle(CONFIG.appName),
    description: t.blogPage.metaDescription,
    openGraph: {
      title:       t.blogPage.ogTitle(CONFIG.appName),
      description: t.blogPage.ogDescription,
      url:         new URL("/blog", CONFIG.siteUrl).toString(),
      siteName:    CONFIG.appName,
    },
  };
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
