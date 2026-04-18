// app/blog/layout.tsx
// Server component — exports SEO metadata for the blog page.
// blog/page.tsx is a client component (needs useTranslation) so metadata
// lives here in the layout, following the same pattern as app/about/layout.tsx.

import { CONFIG } from "@/app/lib/config";
import type { Metadata } from "next";

// eslint-disable-next-line no-restricted-syntax -- TODO(i18n): migrate to generateMetadata + getRequestTranslations. Tracked in issue #89.
export const metadata: Metadata = {
  title: `${CONFIG.appName} Journal — Articles for Overloaded Minds`,
  description:
    "Gentle articles about emotional load, rest, journaling, and self-awareness. No productivity hacks — just softer ways to understand what you're feeling.",
  openGraph: {
    title: `${CONFIG.appName} Journal — Articles for Overloaded Minds`,
    description:
      "Gentle articles about emotional load, rest, and self-awareness. No productivity hacks.",
    url: CONFIG.siteUrl + "/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
