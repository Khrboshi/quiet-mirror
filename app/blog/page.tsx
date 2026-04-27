"use client";

/**
 * app/blog/page.tsx
 *
 * Blog index — lists all published articles from articles.ts.
 * Statically generated. No auth required.
 */
import Link from "next/link";
import { ARTICLES } from "./articles";
import EmailCapture from "@/app/components/EmailCapture";
import ScrollReveal from "@/app/components/ScrollReveal";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";

export default function BlogPage() {
  const { t } = useTranslation();
  const bp = t.blogPage;

  const featuredTopics = [bp.topic1, bp.topic2, bp.topic3];

  // Map English category keys from articles.ts to translated labels
  const categoryLabel: Record<string, string> = {
    "Emotional load":  bp.catEmotionalLoad,
    "Journaling":      bp.catJournaling,
    "Rest":            bp.catRest,
    "Self-awareness":  bp.catSelfAwareness,
  };

  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-qm-border-subtle bg-qm-bg">
        <div className="pointer-events-none absolute start-0 top-0 h-[320px] w-[420px] rounded-full bg-[color:var(--qm-accent-soft)] blur-3xl" />
        <div className="pointer-events-none absolute end-[-80px] top-0 h-[320px] w-[360px] rounded-full bg-[color:var(--qm-accent-2-soft)] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pb-16 sm:pt-16">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-accent">
              {bp.tag(CONFIG.appName)}
            </p>

            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-qm-primary sm:text-5xl">
              {bp.heading}
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
              {bp.subheading}
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-qm-muted">
              {bp.note(CONFIG.appName)}
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {featuredTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-qm-border-card bg-qm-elevated px-3 py-1.5 text-qm-secondary"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-qm-accent-hover"
              >
                {bp.ctaJournal}
              </Link>
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft"
              >
                {bp.ctaPremium}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article grid ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
        <ScrollReveal stagger className="grid gap-5 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="group flex h-full flex-col justify-between rounded-[1.6rem] border border-qm-border-card bg-qm-elevated p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-qm-border-subtle hover:bg-qm-soft"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-accent">
                  {categoryLabel[article.category] ?? article.category}
                </p>
                <h2 className="mt-3 text-xl font-semibold leading-snug text-qm-primary">
                  {article.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-qm-secondary">
                  {article.summary}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="text-xs text-qm-faint">
                  {bp.minRead(article.minutes)}
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-sm font-medium text-qm-accent transition-colors group-hover:text-qm-accent-hover"
                >
                  {bp.readArticle}
                </Link>
              </div>
            </article>
          ))}
        </ScrollReveal>
      </section>

      {/* ── Email capture ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <EmailCapture source="blog-index" variant="blog-index" />
      </section>

      {/* ── Bottom callout ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-20">
        <div className="rounded-[1.8rem] border border-qm-border-card bg-qm-elevated p-6 sm:p-7">
          <h2 className="text-xl font-semibold text-qm-primary sm:text-2xl">
            {bp.bottomH}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-qm-secondary">
            {bp.bottomDesc(CONFIG.appName)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-qm-accent-hover"
            >
              {bp.bottomCta}
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-full border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft"
            >
              {bp.bottomPrivacy}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
