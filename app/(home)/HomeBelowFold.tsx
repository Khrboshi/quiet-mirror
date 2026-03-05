// app/(home)/HomeBelowFold.tsx
import Link from "next/link";

export default function HomeBelowFold() {
  return (
    <>
      {/* ── WHO IT'S FOR ─────────────────────────────────────────────────── */}
      <section className="border-y border-slate-800/60 bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-500">Written for people who are:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Always "on", rarely checked in with themselves",
              "Good at caring for others, hard on themselves",
              "Wanting to understand themselves, not optimise",
            ].map((label) => (
              <span
                key={label}
                className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-slate-400"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950/90 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              A practice that fits around your life
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              No streaks to maintain. No goals to set. Just a quiet place to be
              honest — and something that pays attention.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Write what's actually happening",
                body: "Open Havenly and write for a few minutes — messy, incomplete, honest. This space is for you, not for an audience.",
                accent: "text-emerald-400",
              },
              {
                step: "2",
                title: "Havenly reflects it back",
                body: "Havenly reads what you wrote and offers a gentler version of what it heard — the emotions underneath, the patterns surfacing.",
                accent: "text-violet-400",
              },
              {
                step: "3",
                title: "Start seeing what repeats",
                body: "Over weeks, Havenly shows you what keeps coming up — what drains you, what lifts you, what you keep circling back to.",
                accent: "text-amber-400",
              },
            ].map(({ step, title, body, accent }) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5"
              >
                <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>
                  {step}
                </p>
                <h3 className="mt-2 text-sm font-medium text-white">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU ACTUALLY GET ────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              What Havenly actually shows you
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Not summaries of your day. The things that are harder to see
              from the inside.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                label: "Your top emotion this month",
                example: "Curiosity — 14 times across 22 entries",
                color: "border-violet-500/20 bg-violet-500/5",
                tag: "text-violet-400",
              },
              {
                label: "The theme that keeps appearing",
                example: "Communication — in 10 of your last 15 entries",
                color: "border-emerald-500/20 bg-emerald-500/5",
                tag: "text-emerald-400",
              },
              {
                label: "Your core pattern right now",
                example: "\"You're trying to make sense of the moment while protecting your self-respect.\"",
                color: "border-amber-500/20 bg-amber-500/5",
                tag: "text-amber-400",
              },
              {
                label: "What's been lifting lately",
                example: "Hope, Openness, and Curiosity all trending up",
                color: "border-sky-500/20 bg-sky-500/5",
                tag: "text-sky-400",
              },
              {
                label: "Your weekly pattern summary",
                example: "A personal paragraph written just for you — what Havenly noticed this week",
                color: "border-rose-500/20 bg-rose-500/5",
                tag: "text-rose-400",
              },
              {
                label: "Questions worth sitting with",
                example: "\"What would it mean to stop saying you're fine — just for today?\"",
                color: "border-slate-500/20 bg-slate-500/5",
                tag: "text-slate-400",
              },
            ].map(({ label, example, color, tag }) => (
              <div
                key={label}
                className={`rounded-2xl border p-5 ${color}`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-widest ${tag}`}>
                  {label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400 italic">
                  {example}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/insights/preview"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              See a full example of insights →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLANS ────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 max-w-lg">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Start free. Stay free as long as you like.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              The free plan is genuinely useful on its own. Premium adds
              deeper patterns and weekly summaries — only worth it if it
              genuinely helps you.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Free */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Free
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                Always free
              </p>
              <p className="mt-2 text-sm text-slate-500">
                A private space to write and reflect — no commitment needed.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-slate-400">
                {[
                  "Write anytime, entries stay private",
                  "AI reflections each month",
                  "Gentle daily prompts",
                  "Basic pattern insights",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  href="/magic-login"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Start for free
                </Link>
                <p className="mt-2 text-center text-xs text-slate-700">
                  No credit card. No expiry.
                </p>
              </div>
            </div>

            {/* Premium — early access, no price shown */}
            <div className="relative flex flex-col rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-6">
              <div className="absolute right-4 top-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-400">
                Early access
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500/70">
                Premium
              </p>
              <p className="mt-1 text-2xl font-semibold text-white">
                Deeper clarity
              </p>
              <p className="mt-2 text-sm text-slate-400">
                For people who want to genuinely understand their patterns
                — not just track them.
              </p>

              <ul className="mt-5 space-y-2.5 text-sm text-slate-300">
                {[
                  "Everything in Free",
                  "Unlimited AI reflections",
                  "Full pattern insights across time",
                  "Weekly personal summary from Havenly",
                  "\"Why does this keep happening?\" insights",
                  "Cancel anytime",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6 flex flex-col gap-2">
                <Link
                  href="/upgrade"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  Upgrade to Premium
                </Link>
                <Link
                  href="/insights/preview"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-900 transition-colors"
                >
                  Preview what Premium shows you
                </Link>
              </div>

              <p className="mt-3 text-center text-xs text-slate-700">
                Secure checkout via Stripe · Cancel anytime
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            A few honest answers
          </h2>

          <div className="mt-7 space-y-6">
            {[
              {
                q: "Is this therapy?",
                a: "No. Havenly is a journaling companion — it can sit alongside therapy, coaching, or your own personal practices, but it is not a clinical tool and can't replace professional support.",
              },
              {
                q: "Do I have to write every day?",
                a: "Not at all. Some people check in a few times a week. Others only when life feels particularly full. The patterns Havenly notices get richer over time, but there's no pressure.",
              },
              {
                q: "What happens to my journal entries?",
                a: "They're yours. Stored securely, never used to train AI models, never shared. Havenly is built around the idea that your inner life belongs to you — not the internet.",
              },
              {
                q: "What makes Premium worth it?",
                a: "The free plan gives you good reflections. Premium gives you the full picture — what repeats across weeks and months, a personal weekly summary written just for you, and deeper pattern insights. Worth it if you genuinely want to understand yourself better.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-slate-800/60 pb-5">
                <p className="font-medium text-white">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-xs text-slate-700">
            <Link href="/privacy" className="text-emerald-600 hover:text-emerald-500 transition-colors">
              Read the Privacy Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 border-t border-slate-800/60 py-14">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-5">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Your thoughts deserve a quieter place to land.
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Start with a single entry. No pressure, no performance.
            Just write what's actually going on.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-colors"
            >
              Start for free — no card needed
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-7 py-3 text-sm font-medium text-slate-400 hover:bg-slate-900 transition-colors"
            >
              Learn more about Havenly
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
