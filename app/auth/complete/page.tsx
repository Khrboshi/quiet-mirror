// app/auth/complete/page.tsx
import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import CompleteClient from "./CompleteClient";

export const dynamic = "force-dynamic";

// eslint-disable-next-line no-restricted-syntax -- TODO(i18n): migrate to generateMetadata + getRequestTranslations. Tracked in issue #92.
export const metadata: Metadata = {
  title: `Signing you in | ${CONFIG.appName}`,
  description: `Completing sign-in to ${CONFIG.appName}.`,
  robots: { index: false, follow: false },
};

export default function AuthCompletePage() {
  return <CompleteClient />;
}
