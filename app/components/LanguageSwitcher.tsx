"use client";
import { useTranslation } from "@/app/components/I18nProvider";
interface Props { variant?: "compact" | "full"; }
export default function LanguageSwitcher({ variant = "compact" }: Props) {
  const { locale, setLocale, locales, t } = useTranslation();
  const current = locales.find((l) => l.code === locale) ?? locales[0];
  function cycleLocale() {
    const idx = locales.findIndex((l) => l.code === locale);
    setLocale(locales[(idx + 1) % locales.length].code);
  }
  if (variant === "full") {
    return (
      <div className="flex items-center gap-2 pt-1">
        {locales.map((loc) => {
          const active = loc.code === locale;
          return (
            <button key={loc.code} onClick={() => setLocale(loc.code)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-qm-accent bg-qm-accent-soft text-qm-accent" : "border-qm-card bg-qm-card text-qm-secondary hover:border-qm-accent hover:text-qm-accent"}`}
              aria-pressed={active} aria-label={t.ui.switchToLanguage(loc.label)}>
              <span aria-hidden="true">{loc.flag}</span>
              <span>{loc.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <button onClick={cycleLocale}
      className="inline-flex items-center gap-1 rounded-full border border-qm-card px-2.5 py-1.5 text-xs font-medium text-qm-secondary transition-colors hover:border-qm-accent hover:text-qm-accent"
      aria-label={t.ui.currentLanguage(current.label)} title={current.label}>
      <span aria-hidden="true">{current.flag}</span>
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}
