// app/about/layout.tsx
// Server component — exports SEO metadata for the about page.
// about/page.tsx is a client component (needs useTranslation) so metadata
// lives here in the layout instead, following Next.js App Router conventions.

import { CONFIG } from "@/app/lib/config";
import type { Metadata } from "next";

// eslint-disable-next-line no-restricted-syntax -- TODO(i18n): migrate to generateMetadata + getRequestTranslations. Tracked in issue #88.
export const metadata: Metadata = {
  title: `About ${CONFIG.appName} — The Journal That Reads Underneath`,
  description:
    "A private journal that reflects back what you write — and over time, shows you the patterns you've been too close to see. Built independently, no ads, no investors.",
  openGraph: {
    title: `About ${CONFIG.appName} — The Journal That Reads Underneath`,
    description:
      "A private journal that reflects back what you write — and over time, shows you the patterns you've been too close to see.",
    url: CONFIG.siteUrl + "/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
