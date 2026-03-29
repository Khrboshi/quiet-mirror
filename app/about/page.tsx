import Link from "next/link";
import { CONFIG } from "@/app/lib/config";

export const metadata = {
  title: `About ${CONFIG.appName} — The Journal That Reads Underneath`,
  description:
    "A private journal that reflects back what you write — and over time, shows you the patterns you've been too close to see. Built independently, no ads, no investors.",
  openGraph: {
    title: `About ${CONFIG.appName} — The Journal That Reads Underneath`,
    description:
      "A private journal that reflects back what you write — and over time, shows you the patterns you've been too close to see.",
    url: CONFIG.siteUrl + "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[color:var(--hvn-bg)] text-[color:var(--hvn-text-primary)]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-[color:var(--hvn-border-subtle)] pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
              About {CONFIG.appName}
            </p>

            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
              A mirror for what you carry —{" "}
              <span className="text-emerald-400">
                held quietly, without judgment.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-300 sm:text-[17px]">
              Not a productivity tool. Not a mood tracker. {CONFIG.appName} is a
              place to write honestly, receive a gentle reflection back, and —
              over time — see the patterns that have quietly been shaping your
              weeks.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
              >
                Start journaling free
              </Link>
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                See Pricing &rarr;
              </Link>
            </div>

            <p className="mt-3 text-xs text-slate-600">
              No credit card required. Free is fully usable on its own.
            </p>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-14 px-6 sm:space-y-16">
          {/* Why the name */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Why &#8220;{CONFIG.appName}&#8221;
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-300/90">
              <p>
                A mirror doesn&apos;t advise. It doesn&apos;t judge. It simply
                reflects back what&apos;s already there — clearly, without
                distortion, without noise. That is exactly what this product is
                meant to do.
              </p>
              <p>
                The &ldquo;quiet&rdquo; part matters too. When you&apos;re
                carrying something heavy, the last thing you need is another
                loud surface. You need somewhere still — where you can write
                honestly, see yourself clearly, and leave a little lighter.
              </p>
              <p>
                Most journaling apps store your entries. {CONFIG.appName} does
                something different: it reads across them over time and reflects
                back the thread running through them — the emotions that keep
                surfacing, the themes you return to without noticing, the
                pattern you&apos;ve been living but couldn&apos;t quite name.
              </p>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-emerald-500/15 bg-emerald-500/[0.03] px-6 py-5">
              <p className="font-display text-lg font-medium leading-relaxed text-white">
                &ldquo;Your inner life isn&apos;t content to be optimised. It&apos;s
                yours to understand. {CONFIG.appName} is built around that.&rdquo;
              </p>
            </div>
          </div>

          {/* Built independently */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Built independently
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "No investors",
                  body: `${CONFIG.appName} is independently built and funded. No venture capital, no board, no pressure to grow at the expense of the product or your privacy.`,
                  accent:
                    "border-emerald-500/20 bg-emerald-500/[0.03]",
                  tag: "text-emerald-400/80",
                },
                {
                  label: "No ads, ever",
                  body:
                    "Revenue comes entirely from Premium subscriptions. Your data is never sold, shared, or used to train AI models. That is the complete business model.",
                  accent:
                    "border-violet-500/20 bg-violet-500/[0.03]",
                  tag: "text-violet-400/80",
                },
                {
                  label: "One person accountable",
                  body: `${CONFIG.appName} is built by a single independent developer. Every decision about privacy, product, and pricing has one person behind it — reachable directly at ${CONFIG.supportEmail}.`,
                  accent:
                    "border-emerald-500/20 bg-emerald-500/[0.03]",
                  tag: "text-emerald-400/80",
                },
              ].map(({ label, body, accent, tag }) => (
                <div
                  key={label}
                  className={`rounded-[1.5rem] border p-5 ${accent}`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${tag}`}
                  >
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[color:var(--hvn-card-border)] bg-[color:var(--hvn-bg-elevated)] px-6 py-5">
              <p className="text-sm leading-relaxed text-slate-400">
                If something feels wrong, unclear, or broken —{" "}
                <a
                  href={`mailto:${CONFIG.supportEmail}`}
                  className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  email {CONFIG.supportEmail}
                </a>
                . There is no support ticket system. You&apos;re writing to the
                person who built it.
              </p>
            </div>
          </div>

          {/* What makes it different */}
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                What makes it different
              </h2>

              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-300/90">
                <p>
                  Most journaling apps are passive storage. They hold what you
                  write, then wait. {CONFIG.appName} actively reads across your
                  entries — not to diagnose you, but to hold up a mirror to the
                  thread running through everything you&apos;ve written.
                </p>
                <p>
                  You don&apos;t have to force structure onto yourself. You
                  write honestly, at your own pace, whenever you need to — and{" "}
                  {CONFIG.appName} does the noticing. When you&apos;re ready, it
                  reflects back what it found.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  {CONFIG.appName} is
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300">
                  {[
                    "A private place to write without judgment",
                    "A gentle mirror for what you've written",
                    "A way to see patterns across weeks and months",
                    "Respectful of your pace, your privacy, and your process",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-0.5 shrink-0 text-emerald-500">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-[color:var(--hvn-card-border)] bg-[color:var(--hvn-bg-elevated)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
                  {CONFIG.appName} is not
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
                  {[
                    "Therapy or a substitute for clinical care",
                    "A productivity or self-optimisation tool",
                    "A public or social platform",
                    "Something that requires daily commitment",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2"
                    >
                      <span className="mt-0.5 shrink-0 text-slate-600">
                        &mdash;
                      </span>
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
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                How the AI actually works
              </h2>

              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-300/90">
                <p>
                  When you write an entry and request a reflection, the AI reads
                  what you&apos;ve written and responds with a short, thoughtful
                  paragraph. Not advice. Not a diagnosis. More like a mirror
                  held up gently: it names what it noticed in your words,
                  reflects an emotion back, and sometimes asks a quiet question
                  worth sitting with.
                </p>
                <p>
                  Over time, it reads across your entries to find the recurring
                  threads — which emotions appear most often, which themes keep
                  returning, whether things have been shifting or staying the
                  same. Premium members see this as a fuller pattern view,
                  updated as they write.
                </p>
                <p>
                  The AI is a reflective tool. It is not a replacement for the
                  people in your life, and not a substitute for professional
                  support if you need it.
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[color:var(--hvn-card-border)] bg-[color:var(--hvn-bg-elevated)] p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                Privacy
              </h3>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">
                <p>
                  Your journal is private. Your entries are never used to train
                  AI models, never shared with third parties, and never shown to
                  anyone but you.
                </p>
                <p>
                  We do not run ads and we do not sell data. {CONFIG.appName}{" "}
                  earns revenue from Premium subscriptions — that is the
                  business model, designed that way deliberately.
                </p>
                <p>
                  <Link
                    href="/privacy"
                    className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Read the full Privacy Policy &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col gap-4 border-t border-[color:var(--hvn-border-subtle)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              {CONFIG.appName} works best when you use it honestly, at your own
              pace. There is no streak. No pressure. Just the mirror.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
              >
                Start free
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                Read the blog &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
