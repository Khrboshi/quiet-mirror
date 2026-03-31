import Link from "next/link";
import { ARTICLES } from "./articles";
import EmailCapture from "@/app/components/EmailCapture";
import ScrollReveal from "@/app/components/ScrollReveal";
import { CONFIG } from "@/app/lib/config";

export const metadata = {
  title: `${CONFIG.appName} Journal — Articles for Overloaded Minds`,
  description:
    "Gentle articles about emotional load, rest, journaling, and self-awareness. No productivity hacks — just softer ways to understand what you're feeling.",
  openGraph: {
    title: `${CONFIG.appName} Journal — Articles for Overloaded Minds`,
    description:
      "Gentle articles about emotional load, rest, and self-awareness. No productivity hacks.",
    url: CONFIG.siteUrl + "/blog",
  },
};

const featuredTopics = ["Emotional load", "Journaling", "Rest & burnout"];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-qm-border-subtle bg-qm-bg">
        <div className="pointer-events-none absolute left-0 top-0 h-[320px] w-[420px] rounded-full bg-[color:var(--qm-accent-soft)] blur-3xl" />
        <div className="pointer-events-none absolute right-[-80px] top-0 h-[320px] w-[360px] rounded-full bg-[color:var(--qm-accent-2-soft)] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-12 sm:pb-16 sm:pt-16">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-accent">
              {CONFIG.appName} Journal
            </p>

            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-qm-primary sm:text-5xl">
              Gentle articles for overloaded minds.
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
              These pieces are for people who are doing their best with a lot on
              their plate. No productivity hacks, no optimization — just softer
              ways to understand what you&apos;re feeling and why it makes
              sense.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-qm-muted">
              {CONFIG.appName} articles are written to be read quietly. Nothing
              here is clinical, diagnostic, or designed to push you into
              action. Reflection is allowed to stay slow.
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
                Start a free private journal
              </Link>
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft"
              >
                See what Premium adds
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
                  {article.category}
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
                  {article.minutes} min read
                </span>
                <Link
                  href={`/blog/${article.slug}`}
                  className="text-sm font-medium text-qm-accent transition-colors group-hover:text-qm-accent-hover"
                >
                  Read article &rarr;
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
            Reading can clarify things. Writing often clarifies them more.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-qm-secondary">
            {CONFIG.appName} gives you a private place to put what you&apos;re
            carrying. The AI does not judge, diagnose, or rush you — it reflects
            patterns back gently, only when you ask.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-qm-accent-hover"
            >
              Start free reflection
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-full border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft"
            >
              How your data is protected &rarr;
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
