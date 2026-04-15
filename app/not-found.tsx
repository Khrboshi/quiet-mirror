"use client";
// app/not-found.tsx
// Client component — Next.js 15 does not support async request APIs
// (cookies, headers) in not-found.tsx, so we read locale from localStorage
// using the same detectLocale() pattern as I18nProvider.

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONFIG } from "@/app/lib/config";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getTranslations,
} from "@/app/lib/i18n";

function detectLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored)) return stored;
  } catch {}
  return DEFAULT_LOCALE;
}

export default function NotFound() {
  const [locale, setLocale] = useState<string>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const t = getTranslations(locale);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-qm-bg px-4">
      <div className="mx-auto max-w-md text-center space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-qm-primary">
          {t.errors.notFoundTitle}
        </h1>
        <p className="text-sm leading-relaxed text-qm-muted">
          {t.errors.notFoundBody}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-qm-accent-hover"
          >
            {t.nav.goToDashboard}
          </Link>
          <Link
            href="/"
            className="rounded-full border border-qm-border-subtle px-5 py-2.5 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft"
          >
            {t.nav.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
