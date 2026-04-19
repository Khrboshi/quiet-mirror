// app/about/layout.tsx
// Server component — exports SEO metadata for the about page.
// about/page.tsx is a client component (needs useTranslation) so metadata
// lives here in the layout instead, following Next.js App Router conventions.

import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title:       t.aboutPage.metaTitle(CONFIG.appName),
    description: t.aboutPage.metaDescription,
    openGraph: {
      title:       t.aboutPage.ogTitle(CONFIG.appName),
      description: t.aboutPage.ogDescription,
      url:         new URL("/about", CONFIG.siteUrl).toString(),
      siteName:    CONFIG.appName,
    },
  };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
