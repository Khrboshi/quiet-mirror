/**
 * app/unsubscribe/confirmed/page.tsx
 *
 * Landing page after clicking the unsubscribe link in a newsletter email.
 * Handles both success (?error absent) and failure (?error=1) states.
 * No auth required — this page is public.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title: t.unsubscribePage.metaTitle,
    robots: { index: false },
  };
}

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function UnsubscribeConfirmedPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const isError = error === "1";
  const t = await getRequestTranslations();
  const p = t.unsubscribePage;

  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary flex items-center justify-center px-4">
      {/* Subtle glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-qm-accent/[0.06] blur-[120px]" />

      <div className="relative z-10 w-full max-w-md text-center space-y-6 py-16">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-qm-surface border border-qm-border">
          {isError ? (
            <svg
              className="h-6 w-6 text-qm-warning"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-qm-positive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-semibold tracking-tight text-qm-primary">
          {isError ? p.errorHeading : p.heading}
        </h1>

        {/* Body */}
        <p className="text-sm leading-relaxed text-qm-secondary">
          {isError ? p.errorBody(CONFIG.supportEmail) : p.body}
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-block rounded-full bg-qm-surface border border-qm-border px-6 py-2.5 text-sm font-medium text-qm-primary hover:bg-qm-surface-hover transition-colors"
        >
          {p.backHome}
        </Link>

        {/* App name footer */}
        <p className="text-xs text-qm-muted pt-4">{CONFIG.appName}</p>
      </div>
    </div>
  );
}
