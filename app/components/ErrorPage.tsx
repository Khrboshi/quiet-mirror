// app/components/ErrorPage.tsx
// Shared error boundary UI used by all error.tsx files.
// Single source of truth — update here and all error pages update automatically.
"use client";

import Link from "next/link";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";

type ErrorPageProps = {
  reset: () => void;
  /** Message shown below the heading */
  message?: string;
  /** Where the back link goes — defaults to "/" */
  backHref?: string;
  /** Label for the back link — defaults to t.nav.backToHome */
  backLabel?: string;
};

export default function ErrorPage({
  reset,
  message,
  backHref = "/",
  backLabel,
}: ErrorPageProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? t.errors.genericPageError(CONFIG.appName);
  const displayBackLabel = backLabel ?? t.nav.backToHome;

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-qm-bg px-4">
      <div className="mx-auto max-w-md qm-panel rounded-2xl p-8 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-muted">
          {t.errors.somethingWrong}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-qm-secondary">
          {displayMessage}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="qm-btn-primary px-5 py-2.5 text-sm"
          >
            {t.errors.tryAgain}
          </button>
          <Link
            href={backHref}
            className="qm-btn-secondary rounded-full px-5 py-2.5 text-sm"
          >
            {displayBackLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
