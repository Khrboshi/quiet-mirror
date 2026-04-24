// app/lib/i18n/server.ts
//
// Server-only i18n helpers that centralise the "read the request cookie,
// resolve the locale, return translations" pattern that would otherwise
// be duplicated across every server component, layout, and route handler
// that needs translations.
//
// IMPORTANT: import from here only in server components / server actions /
// route handlers. Importing `next/headers` in a client component will error
// at build time, which is the intentional safety barrier.
//
// Why `await cookies()`?
//   In Next.js 15, `cookies()` is async — it returns `Promise<ReadonlyRequestCookies>`
//   (see node_modules/next/dist/server/request/cookies.d.ts). Dropping the `await`
//   would typecheck (Promise inherits .toString() from Object) but would pass the
//   literal string "[object Promise]" to `getLocaleFromCookieString`, silently
//   defaulting every non-English user back to DEFAULT_LOCALE. The `await` is
//   required, not decorative.

import { cookies } from "next/headers";
import type { Translations } from "./types";
import { getLocaleFromCookieString, getTranslations } from "./locales";

/**
 * Resolve the current request's locale code (e.g. "en", "uk", "ar").
 * Falls back to DEFAULT_LOCALE if the cookie is missing or invalid.
 */
export async function getRequestLocale(): Promise<string> {
  const cookieHeader = (await cookies()).toString();
  return getLocaleFromCookieString(cookieHeader);
}

/**
 * Resolve the current request's locale and return its `Translations`.
 * Most server components want this one — it replaces the three-line
 *     const locale = getLocaleFromCookieString((await cookies()).toString());
 *     const t      = getTranslations(locale);
 * with a single call.
 */
export async function getRequestTranslations(): Promise<Translations> {
  return getTranslations(await getRequestLocale());
}
