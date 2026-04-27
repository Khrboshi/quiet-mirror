/**
 * app/components/LanguageSwitcher.tsx
 *
 * Dropdown UI for switching the app locale.
 * Writes the selected locale to the qm:locale cookie and reloads the page
 * so server components re-render with the new language.
 * Closes on outside click via a ref-based event listener.
 */
"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/app/components/I18nProvider";

interface Props {
  variant?: "dropdown" | "full";
}

export default function LanguageSwitcher({ variant = "dropdown" }: Props) {
  const { locale, setLocale, locales, t } = useTranslation();
  const current = locales.find((l) => l.code === locale) ?? locales[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // ── Mobile: 2-column grid of pill buttons ────────────────────────────────
  if (variant === "full") {
    return (
      <div className="grid grid-cols-2 gap-2 w-full">
        {locales.map((loc) => {
          const active = loc.code === locale;
          return (
            <button
              key={loc.code}
              onClick={() => setLocale(loc.code)}
              aria-pressed={active}
              aria-label={t.ui.switchToLanguage(loc.label)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "border-qm-accent bg-qm-accent-soft text-qm-accent"
                  : "border-qm-card bg-qm-card text-qm-secondary hover:border-qm-accent hover:text-qm-accent"
              }`}
            >
              <span aria-hidden="true" className="text-base">{loc.flag}</span>
              <span>{loc.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── Desktop: dropdown ────────────────────────────────────────────────────
  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.ui.currentLanguage(current.label)}
        className="inline-flex items-center gap-1.5 rounded-full border border-qm-card px-2.5 py-1.5 text-xs font-medium text-qm-secondary transition-colors hover:border-qm-accent hover:text-qm-accent"
      >
        <span aria-hidden="true">{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown
          size={12}
          className={`hidden sm:block transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label={t.ui.selectLanguage}
          className="absolute end-0 top-full z-[60] mt-1.5 w-44 overflow-hidden rounded-2xl border py-1 shadow-lg"
          style={{
            borderColor: "var(--qm-border-card)",
            backgroundColor: "var(--qm-bg-elevated)",
            boxShadow: "var(--qm-shadow-card)",
          }}
        >
          {locales.map((loc) => {
            const active = loc.code === locale;
            return (
              <button
                key={loc.code}
                role="option"
                aria-selected={active}
                onClick={() => { setLocale(loc.code); setOpen(false); }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-qm-accent-soft text-qm-accent font-medium"
                    : "text-qm-secondary hover:bg-qm-accent-soft hover:text-qm-accent"
                }`}
              >
                <span aria-hidden="true" className="text-base">{loc.flag}</span>
                <span>{loc.label}</span>
                {active && (
                  <span className="ms-auto text-qm-accent" aria-hidden="true">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
