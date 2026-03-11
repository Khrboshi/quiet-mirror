import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";

// ─── Data ──────────────────────────────────────────────────────────────────

const recognitions = [
  {
    quote:
      "You keep being the steady one for everyone else, and then wonder why you feel so depleted.",
    accent: "border-violet-500/20 bg-violet-500/[0.04]",
    dot: "bg-violet-400",
  },
  {
    quote:
      "The same tension keeps showing up in different situations, but you cannot quite see the pattern yet.",
    accent: "border-emerald-500/20 bg-emerald-500/[0.04]",
    dot: "bg-emerald-400",
  },
  {
    quote:
      "You want journaling to help, but blank pages and generic prompts never seem to meet you where you are.",
    accent: "border-amber-500/20 bg-amber-500/[0.04]",
    dot: "bg-amber-400",
  },
];

// ─── Component ────────────────────────────────────────────────────────────

export default function HomeBelowFold() {
  return (
    <>
      {/* ── 1. Recognition ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-800/60 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal>
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              If any of this sounds familiar, you&apos;re in the right place.
            </p>
          </ScrollReveal>

          <ScrollReveal stagger className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {recognitions.map(({ quote, accent, dot }) => (
              <div key={quote} className={`rounded-2xl border p-5 ${accent}`}>
                <span className={`mb-3 block h-1.5 w-1.5 rounded-full ${dot}`} />
                <p className="text-sm italic leading-relaxed text-slate-300">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. Concrete AI Demo — Before / After ─────────────────────────── */}
      <section className="border-b border-slate-800/60 section-tinted py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">

          <ScrollReveal className="mb-10 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              What actually happens
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              Write once. Hear it back{" "}
              <span className="text-emerald-400">differently.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
              You write whatever is on your mind — honestly, messily, without
              editing yourself. Havenly reads it and reflects back what it
              noticed. No advice. No diagnosis. Just a mirror held up gently.
            </p>
          </ScrollReveal>

          {/* Before / after demo */}
          <ScrollReveal className="grid gap-4 md:grid-cols-2 md:gap-6">

            {/* Entry card */}
            <div className="rounded-[1.5rem] border border-slate-800/80 bg-slate-900/60 p-6 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  What you write
                </p>
                <span className="rounded-full border border-slate-700/50 px-2 py-0.5 text-[10px] text-slate-600">
                  ~2 min
                </span>
              </div>
              <p className="text-[15px] leading-[1.75] text-slate-200">
                &ldquo;Work has been overwhelming lately. I keep saying yes to
                things and then resenting it afterwards. I don&apos;t know why I
                can&apos;t just say no. At home it&apos;s the same — I end up
                handling everything and nobody seems to notice. I&apos;m
                exhausted but I&apos;d feel guilty if I stepped back.&rdquo;
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Honest", "Unfiltered", "No structure needed"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-700/50 px-2.5 py-0.5 text-[11px] text-slate-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Reflection card */}
            <div className="rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/[0.03] p-6 sm:p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500/70">
                  Havenly reflects
                </p>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  Immediate
                </span>
              </div>
              <p className="text-[15px] leading-[1.75] text-slate-100">
                There&apos;s a pattern worth noticing here: you&apos;re
                absorbing other people&apos;s needs to the point of exhaustion,
                then feeling guilty for wanting relief. That guilt isn&apos;t
                proof you&apos;re asking for too much — it may be proof that
                you&apos;ve been trained to expect very little in return.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: "Emotional load", color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
                  { label: "People-pleasing", color: "border-violet-500/20 bg-violet-500/10 text-violet-300" },
                  { label: "Resentment cycle", color: "border-amber-500/20 bg-amber-500/10 text-amber-300" },
                ].map(({ label, color }) => (
                  <span
                    key={label}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${color}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Three-step flow — compact */}
          <ScrollReveal stagger className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              {
                step: "1",
                label: "Write the version that is actually true",
                sub: "One honest sentence is enough to begin.",
                accent: "text-emerald-400",
                border: "border-emerald-500/20",
              },
              {
                step: "2",
                label: "Get a reflection that names what you feel",
                sub: "Not advice. A mirror. Short, thoughtful, honest.",
                accent: "text-violet-400",
                border: "border-violet-500/20",
              },
              {
                step: "3",
                label: "See what keeps returning over time",
                sub: "Patterns across weeks and months, not just today.",
                accent: "text-amber-400",
                border: "border-amber-500/20",
              },
            ].map(({ step, label, sub, accent, border }) => (
              <div
                key={step}
                className={`rounded-2xl border bg-slate-900/40 p-5 ${border}`}
              >
                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>
                  Step {step}
                </p>
                <p className="text-[15px] font-medium leading-snug text-white">
                  {label}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                  {sub}
                </p>
              </div>
            ))}
          </ScrollReveal>

          <div className="mt-8 text-center">
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
            >
              Write your first entry free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. AI Insight Cards — ELEVATED ──────────────────────────────── */}
      <section className="border-b border-slate-800/60 section-purple-tint py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">

          <ScrollReveal className="mb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
                  What Havenly shows you
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
                  The patterns are easier to trust{" "}
                  <br className="hidden sm:block" />
                  <span className="text-emerald-400">when you can finally see them.</span>
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
                  Across your entries, Havenly finds what keeps surfacing —
                  the emotions, themes, and questions that repeat without you
                  noticing.
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
                  ✦ Premium feature
                </span>
              </div>
            </div>
          </ScrollReveal>

          {/* Insight card grid — large, prominent */}
          <ScrollReveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Card 1 — What shows up most */}
            <div className="rounded-[1.5rem] border border-violet-500/20 bg-violet-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                What shows up most
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl">
                Emotional load appears in{" "}
                <span className="text-violet-300">14 of your last 22</span>{" "}
                entries.
              </p>
              {/* Mini bar */}
              <div className="mt-4 space-y-1.5">
                {[
                  { label: "Emotional load", pct: 64, color: "bg-violet-400" },
                  { label: "Overwhelm", pct: 45, color: "bg-violet-500/60" },
                  { label: "Clarity", pct: 28, color: "bg-violet-600/50" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">{label}</span>
                      <span className="text-[11px] text-slate-600">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — What keeps returning */}
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                What keeps returning
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-white sm:text-xl">
                Responsibility and communication are the{" "}
                <span className="text-emerald-300">two themes most often linked</span> together.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Responsibility", count: "11×", color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
                  { label: "Communication", count: "9×", color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
                  { label: "Boundary-setting", count: "7×", color: "border-slate-600/40 bg-slate-800/50 text-slate-400" },
                  { label: "Exhaustion", count: "6×", color: "border-slate-600/40 bg-slate-800/50 text-slate-400" },
                ].map(({ label, count, color }) => (
                  <div
                    key={label}
                    className={`rounded-xl border px-3 py-2 ${color}`}
                  >
                    <p className="text-[11px] font-medium">{label}</p>
                    <p className="mt-0.5 text-xs opacity-70">{count} this month</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — What may be driving it (Premium) */}
            <div className="relative rounded-[1.5rem] border border-amber-500/20 bg-amber-500/[0.04] p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                  What may be driving it
                </p>
                <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-400">
                  Premium
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                You often sound most overwhelmed when you feel responsible for{" "}
                <span className="text-amber-300">
                  keeping everything steady for everyone else
                </span>{" "}
                — and rarely give yourself the same patience.
              </p>
              <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-3">
                <p className="text-xs leading-relaxed text-slate-400">
                  This pattern appeared in your last 3 weeks of entries. It
                  tends to peak on Sundays.
                </p>
              </div>
            </div>

            {/* Card 4 — What is shifting (Premium) */}
            <div className="relative rounded-[1.5rem] border border-sky-500/20 bg-sky-500/[0.04] p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                  What is shifting
                </p>
                <span className="shrink-0 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-sky-400">
                  Premium
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                Curiosity and honesty are{" "}
                <span className="text-sky-300">rising in recent entries</span> — which often
                signals that something important is becoming clearer.
              </p>
              {/* Arrow trend */}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="text-sky-400">↑</span>
                <span>Clarity signal up over the last 2 weeks</span>
              </div>
            </div>

            {/* Card 5 — Weekly mirror (Premium) */}
            <div className="relative rounded-[1.5rem] border border-rose-500/20 bg-rose-500/[0.04] p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400">
                  Your weekly mirror
                </p>
                <span className="shrink-0 rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-rose-400">
                  Premium
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                This week, your entries returned most often to questions of
                worth, pace, and{" "}
                <span className="text-rose-300">what you&apos;re actually allowed to need</span>.
              </p>
              <p className="mt-3 text-[11px] text-slate-500">
                Generated every Monday · Personal to your entries only
              </p>
            </div>

            {/* Card 6 — A question worth sitting with */}
            <div className="rounded-[1.5rem] border border-slate-500/20 bg-slate-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                A question worth sitting with
              </p>
              <p className="mt-3 text-lg font-medium leading-snug text-white sm:text-xl">
                &ldquo;What keeps making you say you&apos;re fine before
                you&apos;ve had a chance to ask whether you are?&rdquo;
              </p>
              <p className="mt-3 text-xs text-slate-600">
                Generated from your last 6 entries. Not a prompt to answer —
                just something to carry.
              </p>
            </div>

          </ScrollReveal>

          <ScrollReveal className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/insights/preview"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              See a fuller example of Premium insights →
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. What makes it different — compact ─────────────────────────── */}
      <section className="border-b border-slate-800/60 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              What makes it different
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              Most journaling tools keep entries.{" "}
              <span className="text-emerald-400">
                Havenly looks for the thread.
              </span>
            </h2>
          </ScrollReveal>

          <ScrollReveal stagger className="grid gap-4 sm:grid-cols-2">
            {/* Is */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500/70">
                Havenly is
              </p>
              <ul className="space-y-3">
                {[
                  "A private place to write without judgment",
                  "A gentle reflection on what you wrote",
                  "A way to see patterns across weeks and months",
                  "Respectful of your pace and privacy",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Is not */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500/70">
                Havenly is not
              </p>
              <ul className="space-y-3">
                {[
                  "Therapy or a substitute for clinical care",
                  "A productivity or self-optimisation tool",
                  "A public or social platform",
                  "Something you have to use every day",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-0.5 shrink-0 text-amber-500">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. Testimonials ──────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              In their own words
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              The thing they didn&apos;t expect.
            </h2>
          </ScrollReveal>

          {/* Featured quote */}
          <ScrollReveal className="mb-6 rounded-[1.75rem] border border-emerald-500/15 bg-emerald-500/[0.03] p-7 sm:p-8">
            <div className="text-lg text-amber-400">★★★★★</div>
            <p className="mt-4 font-display text-xl leading-relaxed text-white sm:text-2xl">
              &ldquo;I expected a nicer journal app. What surprised me was how
              accurately it reflected the thing underneath what I wrote.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-emerald-500/40 to-violet-500/40 text-sm font-semibold text-white">
                M
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Maya L.</p>
                <p className="text-xs text-slate-600">Used Havenly for 6 weeks</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Two smaller quotes */}
          <ScrollReveal stagger className="grid gap-4 sm:grid-cols-2">
            {[
              {
                quote:
                  "This is the first journaling product that made me feel like my entries were going somewhere instead of just piling up.",
                name: "Tariq A.",
                detail: "Used Havenly for 3 months",
                initial: "T",
                gradient: "from-violet-500/40 to-blue-500/40",
              },
              {
                quote:
                  "The weekly summary connected entries I thought were unrelated. It made a pattern obvious without feeling intrusive.",
                name: "Riya K.",
                detail: "Premium member",
                initial: "R",
                gradient: "from-amber-500/40 to-rose-500/40",
              },
            ].map(({ quote, name, detail, initial, gradient }) => (
              <div
                key={name}
                className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5"
              >
                <div className="mb-3 text-sm text-amber-400">★★★★★</div>
                <p className="text-sm italic leading-relaxed text-slate-300">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${gradient} text-xs font-semibold text-white`}
                  >
                    {initial}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-300">{name}</p>
                    <p className="text-[11px] text-slate-600">{detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── Pattern interrupt ─────────────────────────────────────────────── */}
      <div className="border-y border-slate-800/40 py-12 sm:py-14">
        <ScrollReveal className="mx-auto max-w-4xl px-5 text-center">
          <p className="font-display text-2xl font-medium leading-relaxed text-white sm:text-3xl sm:leading-relaxed">
            Most people don&apos;t lack self-awareness.{" "}
            <span className="text-slate-500">
              They&apos;re just too close to their own life to see the pattern
              clearly.
            </span>
          </p>
        </ScrollReveal>
      </div>

      {/* ── 6. Pricing ────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 section-tinted py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              Free vs Premium
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              Start privately. Upgrade when you want the deeper picture.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Free is enough to begin honestly. Premium is for people who want
              Havenly to connect the dots across weeks and months.
            </p>
          </ScrollReveal>

          <ScrollReveal stagger className="flex flex-col-reverse gap-4 md:grid md:grid-cols-2 md:gap-5">

            {/* Free card */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Free
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                A private place to start
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                A calm place to write honestly, with no commitment, no pressure,
                and no audience.
              </p>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {[
                  { label: "Write anytime", sub: "Your entries stay private" },
                  { label: "3 AI reflections to start", sub: "Enough to discover if this is for you" },
                  { label: "Gentle prompts", sub: "Helpful when you do not know how to begin" },
                  { label: "Basic pattern insights", sub: "A first layer of what keeps showing up" },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-emerald-600">✓</span>
                    <div>
                      <p>{label}</p>
                      <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link
                  href="/magic-login"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                >
                  Start free
                </Link>
                <p className="mt-2 text-center text-xs text-slate-700">
                  No card required. No expiry.
                </p>
              </div>
            </div>

            {/* Premium card */}
            <div className="relative flex flex-col rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/70">
                Premium
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                The full pattern, not just the latest entry
              </p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl font-bold text-white">$30</span>
                <span className="text-sm text-slate-400">/ month</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  Less than one therapy session ($150–200/hr)
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">Cancel anytime</p>
              <p className="mt-3 text-sm text-slate-300">
                Best for people who want to understand what keeps happening, not
                just document what happened today.
              </p>
              <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-xs text-slate-400">
                <p>
                  <span className="text-slate-600">Without Premium:</span> you
                  may sense a pattern but still be too close to it to name.
                </p>
                <p className="mt-1">
                  <span className="text-emerald-500/80">With Premium:</span>{" "}
                  Havenly starts showing what repeats, what is shifting, and
                  what may be underneath it.
                </p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                {[
                  { label: "Unlimited reflections", sub: "Reflect on every entry, not just a few each month" },
                  { label: "Deeper pattern insights", sub: "See recurring themes across weeks and months" },
                  { label: "Weekly personal summary", sub: "A concise mirror of what Havenly noticed this week" },
                  { label: "Why-this-keeps-happening insights", sub: "A clearer view of recurring loops and emotional drivers" },
                  { label: "Everything in Free", sub: "Nothing removed, just a deeper layer added" },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                    <div>
                      <p>{label}</p>
                      <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Link
                  href="/upgrade"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
                >
                  Start seeing the pattern →
                </Link>

                {/* Refund guarantee */}
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-2.5 text-center">
                  <p className="text-xs font-medium text-slate-300">
                    🛡️ 7-day full refund guarantee
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    Not what you expected? Full refund within 7 days — no
                    questions asked.
                  </p>
                </div>

                <Link
                  href="/insights/preview"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-900"
                >
                  Preview Premium insights
                </Link>
              </div>
              <p className="mt-3 text-center text-xs text-slate-700">
                Secure checkout via Stripe
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 7. FAQ ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
              A few honest answers
            </h2>
          </ScrollReveal>

          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {[
              {
                q: "What does Havenly actually say when it reflects back?",
                a: "It depends entirely on what you write. The reflection reads your emotional language, names what seems to be underneath the surface, and connects it to what you have written before. See a live example in the insight preview.",
              },
              {
                q: "Is this therapy?",
                a: "No. Havenly is a private journaling companion. It can sit alongside therapy or personal reflection, but it is not clinical care and it does not replace professional support.",
              },
              {
                q: "Do I need to write every day for it to work?",
                a: "No. Some people write several times a week. Others only when life feels heavy. The more entries you have, the richer the pattern recognition becomes, but there is no streak to maintain.",
              },
              {
                q: "What happens to my entries?",
                a: "They stay private. They are never used to train AI models, never sold, and never shared. Havenly is built around the idea that your inner life belongs to you.",
              },
              {
                q: "Why would someone pay for Premium?",
                a: "Free helps you write and reflect. Premium helps you understand what your entries mean together over time: recurring themes, hidden patterns, weekly summaries, and clearer insight into why something keeps happening.",
              },
            ].map(({ q, a }) => (
              <ScrollReveal key={q}>
                <div className="border-b border-slate-800/60 pb-5">
                  <p className="text-[15px] font-medium text-white sm:text-base">
                    {q}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {a}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-8 text-xs text-slate-700">
            <Link
              href="/privacy"
              className="text-emerald-600 transition-colors hover:text-emerald-500"
            >
              Read the Privacy Policy &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── 8. Closing CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-800/60 section-cta-gradient py-20 sm:py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[120px]" />

        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <ScrollReveal>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/60">
              Ready when you are
            </p>
            <h2 className="font-display text-3xl font-semibold leading-[1.08] text-white sm:text-4xl">
              Something is trying to become clear.
              <br />
              <span className="text-emerald-400">
                Let&apos;s help you hear it.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
              You don&apos;t need to have it figured out to begin. One honest
              sentence is enough.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-950 shadow-xl shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:-translate-y-0.5"
              >
                Write your first entry free →
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-slate-600">
              <span>✓ Private by default</span>
              <span>✓ Never trains AI models</span>
              <span>✓ 7-day refund guarantee</span>
              <span>✓ 2,400+ quiet writers</span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
