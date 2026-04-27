/**
 * app/language/page.tsx
 *
 * Language selection page — allows users to pick their preferred locale.
 * Writes the selection to the qm:locale cookie and redirects to the
 * previous page (or home if no referrer).
 */
"use client";
// app/language/page.tsx
// Dedicated language selection page — shows all languages from LOCALE_REGISTRY
// Adding a language to locales.ts automatically adds it here.

import { useTranslation } from "@/app/components/I18nProvider";
import { useRouter } from "next/navigation";

export default function LanguagePage() {
  const { t, locale, setLocale, locales } = useTranslation();
  const router = useRouter();
  const lp = t.languagePage;

  function handleSelect(code: string) {
    setLocale(code);
  }

  function handleContinue() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-qm-bg flex flex-col items-center justify-center px-5 py-16">

      {/* Header */}
      <div className="mb-10 text-center max-w-md">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-qm-primary sm:text-4xl">
          {lp.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-qm-secondary">
          {lp.subtitle}
        </p>
      </div>

      {/* Language cards — auto-generated from LOCALE_REGISTRY */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {locales.map((loc) => {
          const isActive = loc.code === locale;
          return (
            <button
              key={loc.code}
              onClick={() => handleSelect(loc.code)}
              dir={loc.dir}
              className={`w-full rounded-2xl border px-6 py-5 text-start transition-all duration-150 ${
                isActive
                  ? "border-qm-accent bg-qm-accent-soft shadow-sm"
                  : "border-qm-card bg-qm-card hover:border-qm-accent hover:bg-qm-accent-soft"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{loc.flag}</span>
                  <div>
                    <p className="font-semibold text-qm-primary">{loc.label}</p>
                    <p className="text-xs text-qm-muted mt-0.5">{loc.aiName ?? "English"}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="rounded-full border border-qm-accent bg-qm-accent px-3 py-0.5 text-[11px] font-semibold text-white">
                    {lp.active}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        className="qm-btn-primary mt-8 inline-flex items-center justify-center px-8 py-3.5 text-sm"
      >
        {lp.continueBtn}
      </button>
    </div>
  );
}
