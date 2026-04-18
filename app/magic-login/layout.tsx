// app/magic-login/layout.tsx
import { CONFIG } from "@/app/lib/config";

import type { Metadata } from "next";
import { getRequestTranslations } from "@/app/lib/i18n/server";

// eslint-disable-next-line no-restricted-syntax -- TODO(i18n): migrate to generateMetadata + getRequestTranslations. Tracked in issue #87.
export const metadata: Metadata = {
  title: `Sign in to ${CONFIG.appName}`,
  description: `Sign in to your private ${CONFIG.appName} journal with a magic link — no password needed. Your entries remain private and secure.`,
  robots: {
    index: false, // Prevent search engines from indexing login page
    follow: false,
  },
  // Add OpenGraph for better sharing if someone bookmarks
  openGraph: {
    title: `Sign in to ${CONFIG.appName}`,
    description: `Access your private journal with a secure magic link.`,
    url: `/magic-login`,
  },
};

export default async function MagicLoginLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const t = await getRequestTranslations();
  return (
    <>
      {/*
        Accessibility: Skip link specifically for login flow
        This helps keyboard users navigate the login page more efficiently
      */}
      <a
        href="#login-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-qm-accent focus:px-5 focus:py-3 focus:text-sm focus:text-white focus:shadow-lg"
      >
        {t.ui.skipToLoginForm}
      </a>

      {/*
        Accessibility: Role and landmark for the main login area
      */}
      <main
        id="login-form"
        role="main"
        aria-label={t.magicLoginPage.formAriaLabel}
        className="min-h-screen bg-qm-bg"
      >
        {children}
      </main>
    </>
  );
}
