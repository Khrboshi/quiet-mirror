/**
 * app/(protected)/tools/page.tsx
 *
 * Tools hub — server-rendered page listing available Premium tools.
 * Shows upgrade prompt for free users. Links to Suggestions, Reflection, and Mood.
 */
import Link from "next/link";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const t = await getRequestTranslations();
  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
          {t.toolsPage.pageLabel}
        </p>
        <h1 className="font-display text-3xl font-semibold text-qm-primary">
          {t.toolsPage.pageTitle}
        </h1>
        <p className="text-sm text-qm-muted max-w-xl">
          {t.toolsPage.pageSubtitle}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Link
          href="/tools/mood"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">{t.toolsPage.moodTitle}</h3>
          <p className="text-sm text-qm-muted">{t.toolsPage.moodSubtitle}</p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            {t.toolsPage.openLabel}
          </p>
        </Link>

        <Link
          href="/tools/reflection"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">{t.toolsPage.reflectionTitle}</h3>
          <p className="text-sm text-qm-muted">{t.toolsPage.reflectionSubtitle}</p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            {t.toolsPage.openLabel}
          </p>
        </Link>

        <Link
          href="/tools/suggestions"
          className="group rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 transition hover:border-qm-positive-border hover:bg-qm-elevated"
        >
          <h3 className="mb-2 font-medium text-qm-primary">{t.toolsPage.suggestionsTitle}</h3>
          <p className="text-sm text-qm-muted">{t.toolsPage.suggestionsSubtitle}</p>
          <p className="mt-4 text-xs font-medium text-qm-positive transition group-hover:text-qm-positive-hover">
            {t.toolsPage.openLabel}
          </p>
        </Link>
      </div>
    </div>
  );
}
