// app/install/layout.tsx
//
// Metadata is generated per-request so it reflects the user's current locale
// (cookie-resolved via getRequestTranslations). Using `export const metadata`
// here would freeze the English strings at build time — which is the exact
// hardcoding bug this file used to carry.

import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title: t.installPage.metaTitle(CONFIG.appName),
    description: t.installPage.metaDescription(CONFIG.appName),
  };
}

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
