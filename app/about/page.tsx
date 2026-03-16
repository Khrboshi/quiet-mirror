import Link from "next/link";

export const metadata = {
  title: "About Havenly — A Journal for Understanding Yourself",
  description:
    "Built for people who want to understand themselves better, not optimize themselves harder.",
  openGraph: {
    title: "About Havenly — A Journal for Understanding Yourself",
    description:
      "Built for people who want to understand themselves better, not optimize themselves harder.",
    url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://havenly-2-1.vercel.app") + "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 pb-16 pt-12 sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
              About Havenly
            </p>

            <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
              A private journal that notices what you carry —{" "}
              <span className="text-emerald-400">
                and helps you see it clearly.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-300 sm:text-[17px]">
              Not a productivity tool. Not a mood tracker. Havenly is a place to
              write honestly, get a gentle reflection back, and — over time — see
              the patterns that have quietly been shaping your weeks.
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
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
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

      {/* ── Body sections ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl space-y-14 px-6 sm:space-y-16">

          {/* Why it exists */}
          <div className="max-w-4xl">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Why it exists
            </h2>

            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-300/90">
              <p>
                I built Havenly because I kept noticing the same thing in myself
                and in people around me: we carry a lot. The emotional labour of
                relationships, the low hum of work stress, and the way the same
                patterns seem to come back no matter how much we try to handle
                things differently.
              </p>

              <p>
                Journaling helped me, but it often felt like writing into a void.
                I could pour something out, close the notebook, and still not
                fully understand what I was actually feeling or why it kept
                happening.
              </p>

              <p>
                Havenly exists to close that loop. You write. It reflects. Over
                time, it helps you see the thread — not to diagnose you or fix
                you, but because understanding yourself is genuinely useful.
              </p>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-emerald-500/15 bg-emerald-500/[0.03] px-6 py-5">
              <p className="font-display text-lg font-medium leading-relaxed text-white">
                &ldquo;Your inner life isn&apos;t content. It&apos;s yours.
                Havenly is built around that idea.&rdquo;
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
                  Most journaling apps store your entries. Some add reminders.
                  Some let you tag your mood. Havenly does something different:
                  it reads what you&apos;ve written across time and looks for the
                  things that quietly repeat — the emotions that keep surfacing,
                  the themes you return to without realising, and the patterns
                  that have been there for weeks or months.
                </p>

                <p>
                  You do not have to force structure onto yourself to make this
                  happen. You write honestly, and Havenly does the noticing.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  Havenly is
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300">
                  {[
                    "A private place to write without judgment",
                    "A gentle reflection on what you wrote",
                    "A way to see patterns across weeks and months",
                    "Respectful of your pace and privacy",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/40 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/70">
                  Havenly is not
                </p>
                <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-400">
                  {[
                    "Therapy or a substitute for clinical care",
                    "A productivity or self-optimisation tool",
                    "A public or social platform",
                    "Something you have to use every day",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0 text-slate-600">&mdash;</span>
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
                  paragraph — not advice and not a diagnosis. More like a mirror
                  held up gently: it names what it noticed in your words, reflects
                  an emotion back, and sometimes asks a quiet question.
                </p>

                <p>
                  Over time, the AI looks across your entries to find recurring
                  threads: which emotions appear most often, which themes keep
                  returning, and whether things have been shifting or staying the
                  same. Premium members see this as a fuller insights view —
                  their personal pattern, updated as they write.
                </p>

                <p>
                  The AI is a tool for reflection, not a replacement for the
                  people in your life, and not a substitute for professional
                  support if you need it.
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-slate-800 bg-slate-900/35 p-6">
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
                  We do not run ads and we do not sell data. Havenly earns
                  revenue from Premium subscriptions — that is the business
                  model, and it is designed that way deliberately.
                </p>

                <p>
                  <Link
                    href="/privacy"
                    className="font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Read our full Privacy Policy &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Havenly works best when you use it honestly, at your own pace.
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
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
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
