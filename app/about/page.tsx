"use client";

import Link from "next/link";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";

export default function AboutPage() {
  const { t } = useTranslation();
  const ap = t.aboutPage;

  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive-muted">
              {ap.tag(CONFIG.appName)}
            </p>
            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-qm-primary sm:text-5xl">
              {ap.headline1}{" "}
              <span className="text-qm-positive">{ap.headline2}</span>
            </h1>
            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
              {ap.subheadline(CONFIG.appName)}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
              >
                {ap.ctaStart}
              </Link>
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-5 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
              >
                {ap.ctaPricing}
              </Link>
            </div>
            <p className="mt-3 text-xs text-qm-faint">{ap.noCreditCard}</p>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-14 px-6 sm:space-y-16">

          {/* Why the name */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
              {ap.whyNameTag(CONFIG.appName)}
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
              <p>{ap.why1}</p>
              <p>{ap.why2}</p>
              <p>{ap.why3(CONFIG.appName)}</p>
            </div>
            <div className="mt-8 rounded-[1.6rem] border border-qm-positive-border bg-qm-positive-strong/[0.03] px-6 py-5">
              <p className="font-display text-lg font-medium leading-relaxed text-qm-primary">
                {ap.pullQuote(CONFIG.appName)}
              </p>
            </div>
          </div>

          {/* Built independently */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
              {ap.builtIndepTag}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: ap.card1Label, body: ap.card1Body(CONFIG.appName),                         accent: "border-qm-positive-border bg-qm-positive-strong/[0.03]", tag: "text-qm-positive-muted" },
                { label: ap.card2Label, body: ap.card2Body,                                         accent: "border-qm-premium-border bg-qm-premium-strong/[0.03]",  tag: "text-qm-premium-muted"  },
                { label: ap.card3Label, body: ap.card3Body(CONFIG.appName, CONFIG.supportEmail),     accent: "border-qm-positive-border bg-qm-positive-strong/[0.03]", tag: "text-qm-positive-muted" },
              ].map(({ label, body, accent, tag }) => (
                <div key={label} className={`rounded-[1.5rem] border p-5 ${accent}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tag}`}>
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-qm-muted">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-qm-border-card bg-qm-elevated px-6 py-5">
              <p className="text-sm leading-relaxed text-qm-muted">
                {ap.contactNote(CONFIG.supportEmail).split(CONFIG.supportEmail)[0]}
                <a
                  href={`mailto:${CONFIG.supportEmail}`}
                  className="font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
                >
                  {CONFIG.supportEmail}
                </a>
                {ap.contactNote(CONFIG.supportEmail).split(CONFIG.supportEmail)[1]}
              </p>
            </div>
          </div>

          {/* What makes it different */}
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                {ap.differentTag}
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
                <p>{ap.different1(CONFIG.appName)}</p>
                <p>{ap.different2(CONFIG.appName)}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
                  {ap.isTag(CONFIG.appName)}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-qm-secondary">
                  {[ap.is1, ap.is2, ap.is3, ap.is4].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-qm-positive">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[1.5rem] border border-qm-border-card bg-qm-elevated p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-warning">
                  {ap.isNotTag(CONFIG.appName)}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-qm-muted">
                  {[ap.isNot1, ap.isNot2, ap.isNot3, ap.isNot4].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-qm-faint">&mdash;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* How the AI works */}
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                {ap.aiTag}
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
                <p>{ap.ai1}</p>
                <p>{ap.ai2}</p>
                <p>{ap.ai3}</p>
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-qm-border-card bg-qm-elevated p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                {ap.privacyTag}
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-qm-muted">
                <p>{ap.privacy1}</p>
                <p>{ap.privacy2(CONFIG.appName)}</p>
                <p>
                  <Link
                    href="/privacy"
                    className="font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
                  >
                    {ap.privacyLink}
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Safeguarding note */}
          <div className="max-w-4xl rounded-[1.5rem] border border-qm-border-card bg-qm-elevated px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
              {ap.safeguardTag}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">
              {ap.safeguardBody}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-qm-faint">
              {ap.safeguardCrisisLine}
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col gap-4 border-t border-qm-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-qm-faint">
              {ap.footerNote(CONFIG.appName)}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
              >
                {ap.ctaStartFree}
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-5 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
              >
                {ap.ctaBlog}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
