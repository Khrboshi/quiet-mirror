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
    <main className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive-muted">
              About {CONFIG.appName}
            </p>

            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-qm-primary sm:text-5xl">
              A mirror for what you carry —{" "}
              <span className="text-qm-positive">
                held quietly, without judgment.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
              Not a productivity tool. Not a mood tracker. {CONFIG.appName} is a
              place to write honestly, receive a gentle reflection back, and —
              over time — see the patterns that have quietly been shaping your
              weeks.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
              >
                Start journaling free
              </Link>
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-5 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
              >
                See Pricing &rarr;
              </Link>
            </div>

            <p className="mt-3 text-xs text-qm-faint">
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
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
              Why &#8220;{CONFIG.appName}&#8221;
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
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

            <div className="mt-8 rounded-[1.6rem] border border-qm-positive-border bg-qm-positive-strong/[0.03] px-6 py-5">
              <p className="font-display text-lg font-medium leading-relaxed text-qm-primary">
                &ldquo;Your inner life isn&apos;t content to be optimised. It&apos;s
                yours to understand. {CONFIG.appName} is built around that.&rdquo;
              </p>
            </div>
          </div>

          {/* Built independently */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
              Built independently
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "No investors",
                  body: `${CONFIG.appName} is independently built and funded. No venture capital, no board, no pressure to grow at the expense of the product or your privacy.`,
                  accent:
                    "border-qm-positive-border bg-qm-positive-strong/[0.03]",
                  tag: "text-qm-positive-muted",
                },
                {
                  label: "No ads, ever",
                  body:
                    "Revenue comes entirely from Premium subscriptions. Your data is never sold, shared, or used to train AI models. That is the complete business model.",
                  accent:
                    "border-qm-premium-border bg-qm-premium-strong/[0.03]",
                  tag: "text-qm-premium-muted",
                },
                {
                  label: "One person accountable",
                  body: `${CONFIG.appName} is built by a single independent developer. Every decision about privacy, product, and pricing has one person behind it — reachable directly at ${CONFIG.supportEmail}.`,
                  accent:
                    "border-qm-positive-border bg-qm-positive-strong/[0.03]",
                  tag: "text-qm-positive-muted",
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
                  <p className="mt-3 text-sm leading-relaxed text-qm-muted">
                    {body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-qm-border-card bg-qm-elevated px-6 py-5">
              <p className="text-sm leading-relaxed text-qm-muted">
                If something feels wrong, unclear, or broken —{" "}
                <a
                  href={`mailto:${CONFIG.supportEmail}`}
                  className="font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
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
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                What makes it different
              </h2>

              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
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
              <div className="rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
                  {CONFIG.appName} is
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-qm-secondary">
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
                      <span className="mt-0.5 shrink-0 text-qm-positive">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-qm-border-card bg-qm-elevated p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-warning">
                  {CONFIG.appName} is not
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-qm-muted">
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
                      <span className="mt-0.5 shrink-0 text-qm-faint">
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
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                How the AI actually works
              </h2>

              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-qm-secondary">
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

            <div className="rounded-[1.6rem] border border-qm-border-card bg-qm-elevated p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-faint">
                Privacy
              </h3>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-qm-muted">
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
                    className="font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
                  >
                    Read the full Privacy Policy &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="flex flex-col gap-4 border-t border-qm-border-subtle pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-qm-faint">
              {CONFIG.appName} works best when you use it honestly, at your own
              pace. There is no streak. No pressure. Just the mirror.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
              >
                Start free
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-5 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
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
