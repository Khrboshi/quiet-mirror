import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";
import type { Metadata } from "next";

// eslint-disable-next-line no-restricted-syntax -- TODO(i18n): migrate to generateMetadata + getRequestTranslations. Tracked in issue #90.
export const metadata: Metadata = {
  title: `Upgrade to Premium | ${CONFIG.appName}`,
  description: `Unlock unlimited AI reflections, weekly pattern summaries, and deep insight tracking. ${PRICING.monthlyCadence}.`,
};

export default function UpgradeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
