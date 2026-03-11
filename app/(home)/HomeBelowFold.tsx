import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";

// ─── Data ────────────────────────────────────────────────────────────────────

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

const steps = [
  {
    step: "1",
    title: "Write the version that is actually true",
    body: "A full entry helps, but it is not required. One honest sentence is enough to begin. Messy thoughts still count.",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    step: "2",
    title: "Get a reflection that helps you hear yourself",
    body: "Havenly responds to what you wrote with a short reflection that names emotional weight, tension, or themes you may have skimmed past.",
    accent: "text-violet-400",
    border: "border-violet-500/20",
  },
  {
    step: "3",
    title: "See what keeps returning over time",
    body: "Across your entries, Havenly starts connecting the dots: what drains you, what softens, what you keep carrying, and what keeps repeating.",
    accent: "text-amber-400",
    border: "border-amber-500/20",
  },
];

const insightCards = [
  {
    label: "What shows up most",
    example: "Emotional load appears in 14 of your last 22 entries.",
    color: "border-violet-500/20 bg-violet-500/5",
    tag: "text-violet-400",
    premium: false,
  },
  {
    label: "What keeps returning",
    example:
      "Responsibility and communication are the two themes most often linked together.",
    color: "border-emerald-500/20 bg-emerald-500/5",
    tag: "text-emerald-400",
    premium: false,
  },
  {
    label: "What may be driving it",
    example:
      "You often sound most overwhelmed when you feel responsible for keeping everything steady for everyone else.",
    color: "border-amber-500/20 bg-amber-500/5",
    tag: "text-amber-400",
    premium: true,
  },
  {
    label: "What is shifting",
    example:
      "Curiosity and honesty are rising in recent entries, which often signals that something important is becoming clearer.",
    color: "border-sky-500/20 bg-sky-500/5",
    tag: "text-sky-400",
    premium: true,
  },
  {
    label: "Your weekly mirror",
    example:
      "A short personal summary of what Havenly noticed across the week, written just for you.",
    color: "border-rose-500/20 bg-rose-500/5",
    tag: "text-rose-400",
    premium: true,
  },
  {
    label: "A question worth sitting with",
    example:
      "What keeps making you say you are fine before you have had a chance to ask whether you are?",
    color: "border-slate-500/20 bg-slate-500/5",
    tag: "text-slate-400",
    premium: false,
  },
];

const faqs = [
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
];

// ─── Component ────────────────────────────────────────────────────────────────

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

      {/* ── 2. How it works ───────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 section-tinted py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              How it works
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              Write once. Hear it back differently.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Havenly is not just a place to store your thoughts. It helps you
              hear what your own words may be pointing to, then notice what
              keeps returning.
            </p>
          </ScrollReveal>

          <ScrollReveal stagger className="mt-8 grid gap-3 sm:gap-4 md:grid-cols-3">
            {steps.map(({ step, title, body, accent, border }) => (
              <div
                key={step}
                className={`rounded-2xl border bg-slate-900/40 p-5 ${border}`}
              >
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>
                  Step {step}
                </p>
                <h3 className="mt-2 text-[15px] font-medium text-white sm:text-base">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── Mid-page CTA ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/40 bg-slate-950/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 sm:flex-row sm:justify-center">
          <p className="text-center text-sm text-slate-400">
            Curious what a reflection looks like for your words?
          </p>
          <Link
            href="/magic-login"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
          >
            Write your first entry free →
          </Link>
        </div>
      </div>

      {/* ── 3. What makes it different ────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 section-purple-tint py-12 sm:py-18">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">

            <ScrollReveal className="max-w-xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
                What makes it different
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
                Most journaling tools keep entries.{" "}
                <span className="text-emerald-400">
                  Havenly looks for the thread.
                </span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                You do not need to tag your mood, track a streak, or force
                structure onto yourself. You write honestly. Havenly notices
                what repeats across your words, your emotional tone, and the
                themes that keep resurfacing.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-500/70">
                    Havenly is
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {[
                      "A private place to write honestly",
                      "A reflection tool, not a feed",
                      "Pattern recognition across time",
                      "Built around privacy from the start",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-500/70">
                    Havenly is not
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {[
                      "A productivity tracker",
                      "Therapy or medical advice",
                      "A public or social platform",
                      "Something that pressures daily use",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-amber-500">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Premium insight preview card */}
            <ScrollReveal className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-950 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Example insight view
                </p>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Premium
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {insightCards.map(({ label, example, color, tag, premium }) => (
                  <div key={label} className={`relative rounded-2xl border p-4 ${color}`}>
                    {premium && (
                      <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Premium
                      </span>
                    )}
                    <p className={`pr-14 text-[10px] font-semibold uppercase tracking-[0.18em] ${tag}`}>
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{example}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <Link
                  href="/insights/preview"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
                >
                  See a fuller example of Premium insights &rarr;
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── 4. Testimonials — redesigned ──────────────────────────────────── */}
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
                quote: "This is the first journaling product that made me feel like my entries were going somewhere instead of just piling up.",
                name: "Tariq A.",
                detail: "Used Havenly for 3 months",
                initial: "T",
                gradient: "from-violet-500/40 to-blue-500/40",
              },
              {
                quote: "The weekly summary connected entries I thought were unrelated. It made a pattern obvious without feeling intrusive.",
                name: "Riya K.",
                detail: "Premium member",
                initial: "R",
                gradient: "from-amber-500/40 to-rose-500/40",
              },
            ].map(({ quote, name, detail, initial, gradient }) => (
              <div key={name} className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5">
                <div className="mb-3 text-sm text-amber-400">★★★★★</div>
                <p className="text-sm italic leading-relaxed text-slate-300">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${gradient} text-xs font-semibold text-white`}>
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

      {/* ── Pattern Interrupt ─────────────────────────────────────────────── */}
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

      {/* ── 5. Pricing ────────────────────────────────────────────────────── */}
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Free</p>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500/70">Premium</p>
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

                {/* Refund guarantee — directly under CTA */}
                <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-2.5 text-center">
                  <p className="text-xs font-medium text-slate-300">🛡️ 7-day full refund guarantee</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                    Not what you expected? Full refund within 7 days — no questions asked.
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

      {/* ── 6. FAQ ────────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal>
            <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
              A few honest answers
            </h2>
          </ScrollReveal>

          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {faqs.map(({ q, a }) => (
              <ScrollReveal key={q}>
                <div className="border-b border-slate-800/60 pb-5">
                  <p className="text-[15px] font-medium text-white sm:text-base">{q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{a}</p>
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

      {/* ── 7. Closing CTA — elevated ─────────────────────────────────────── */}
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
              You don&apos;t need to have it figured out to begin.
              One honest sentence is enough.
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
