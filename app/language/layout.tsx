// app/language/layout.tsx
//
// Metadata is generated per-request so it reflects the user's current locale
// (cookie-resolved via getRequestTranslations). The sibling page.tsx is a
// client component that uses `useTranslation` + `setLocale`, so metadata
// can't live there — `export const metadata` in a "use client" file is
// blocked by ESLint, and `generateMetadata` only runs in server components.

import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title: t.languagePage.metaTitle(CONFIG.appName),
    description: t.languagePage.metaDescription(CONFIG.appName),
  };
}

export default function LanguageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
