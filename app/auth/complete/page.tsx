// app/auth/complete/page.tsx
import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";
import CompleteClient from "./CompleteClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title: t.authComplete.metaTitle(CONFIG.appName),
    description: t.authComplete.metaDescription(CONFIG.appName),
    robots: { index: false, follow: false },
  };
}

export default function AuthCompletePage() {
  return <CompleteClient />;
}
