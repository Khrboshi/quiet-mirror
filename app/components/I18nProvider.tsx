"use client";
/**
 * app/components/I18nProvider.tsx
 *
 * Client-side i18n context — reads the locale from the qm:locale cookie
 * and provides translations to all child components via useTranslation().
 * Server components use getRequestTranslations() from app/lib/i18n/server.ts instead.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Translations } from "@/app/lib/i18n/types";
import type { LocaleDefinition } from "@/app/lib/i18n";
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, LOCALE_REGISTRY, SUPPORTED_LOCALES, getTranslations, getDir, detectLocale } from "@/app/lib/i18n";

interface I18nContextValue {
  locale:    string;
  t:         Translations;
  dir:       "ltr" | "rtl";
  setLocale: (code: string) => void;
  locales:   LocaleDefinition[];
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE, t: getTranslations(DEFAULT_LOCALE),
  dir: getDir(DEFAULT_LOCALE), setLocale: () => {}, locales: LOCALE_REGISTRY,
});

function applyToDocument(code: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = code;
  document.documentElement.dir  = getDir(code);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);
  const router = useRouter();
  useEffect(() => { const d = detectLocale(); setLocaleState(d); applyToDocument(d); }, []);
  const setLocale = useCallback((next: string) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;
    // Short-circuit when the user re-selects the already-active locale.
    // Without this guard, re-clicking the current language would write the
    // cookie + localStorage unchanged AND trigger a full router.refresh()
    // below, causing a pointless server refetch of every page.
    if (next === locale) return;
    setLocaleState(next);
    applyToDocument(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
      document.cookie = `${LOCALE_STORAGE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`;
    } catch {}
    // Tell Next.js to re-render server components with the new cookie.
    // Without this, any server-rendered text (root layout, protected layout,
    // magic-login layout, LoadingIndicator, privacy/terms chrome, settings,
    // blog slug, insights/preview, etc.) keeps its previous language until
    // the user hard-refreshes. Client components (Navbar, DashboardClient,
    // InsightsClient, etc.) update from React state immediately, but the
    // server-rendered shell drifts out of sync. router.refresh() refetches
    // the server tree while preserving in-memory client state.
    router.refresh();
  }, [locale, router]);
  return (
    <I18nContext.Provider value={{ locale, t: getTranslations(locale), dir: getDir(locale), setLocale, locales: LOCALE_REGISTRY }}>
      {children}
    </I18nContext.Provider>
  );
}
export function useTranslation() { return useContext(I18nContext); }
