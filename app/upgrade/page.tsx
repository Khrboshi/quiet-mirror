import Link from "next/link";

export const metadata = {
  title: "Upgrade to Havenly Premium",
  description:
    "See the deeper pattern behind your entries with Havenly Premium: unlimited reflections, recurring themes, weekly summaries, and clearer insight over time.",
};

const premiumFeatures = [
  {
    title: "Unlimited reflections",
    body: "Reflect on every entry, not just a few each month.",
    accent: "border-emerald-500/20",
    tag: "text-emerald-400",
  },
  {
    title: "Full pattern insights",
    body: "See what repeats across weeks and months — not only what stands out today.",
    accent: "border-violet-500/20",
    tag: "text-violet-400",
  },
  {
    title: "Weekly personal summary",
    body: "A concise written mirror of what Havenly noticed across your week.",
    accent: "border-amber-500/20",
    tag: "text-amber-400",
  },
  {
    title: "Why-this-keeps-happening insight",
    body: "Go beyond surface description and get closer to the recurring emotional loop underneath.",
    accent: "border-sky-500/20",
    tag: "text-sky-400",
  },
  {
    title: "Everything in Free",
    body: "Keep the private writing space, gentle prompts, and all core journaling features.",
    accent: "border-slate-700/40",
    tag: "text-slate-500",
  },
];

const insightExamples = [
  {
    label: "What you feel most",
    text: "Emotional load appears in 14 of your last 22 entries.",
    labelClass: "text-violet-300",
    border: "border-violet-500/15 bg-violet-500/[0.04]",
  },
  {
    label: "What keeps coming back",
    text: "Responsibility and communication are the two themes most often linked together.",
    labelClass: "text-emerald-300",
    border: "border-emerald-500/15 bg-emerald-500/[0.04]",
  },
  {
    label: "Your hidden pattern right now",
    text: "You may be moving into a cycle of emotional over-functioning and self-silencing.",
    labelClass: "text-amber-300",
    border: "border-amber-500/15 bg-amber-500/[0.04]",
  },
  {
    label: "What is shifting in you",
    text: "Curiosity and honesty are rising in recent entries, which often means something important is becoming clearer.",
    labelClass: "text-sky-300",
    border: "border-sky-500/15 bg-sky-500/[0.04]",
  },
  {
    label: "Your weekly mirror",
    text: "A personal summary of what Havenly noticed this week across your entries.",
    labelClass: "text-rose-300",
    border: "border-rose-500/15 bg-rose-500/[0.04]",
  },
  {
    label: "A question worth sitting with",
    text: "What keeps making you say you are fine before you have had a chance to ask whether you are?",
    labelClass: "text-slate-300",
    border: "border-slate-700/40 bg-slate-900/30",
  },
];

const faqs = [
  {
    q: "What does Havenly actually show me with Premium?",
    a: "Premium unlocks the layer that reads across all your entries over time — not just the one you wrote today. You start seeing which emotional themes appear most often, how they connect to each other, what has been shifting, and why something may keep happening. The weekly summary pulls it all together into one personal read each week.",
  },
  {
    q: "What is your refund policy?",
    a: "If Havenly Premium is not what you expected, email support@havenly.app within 7 days of your first charge and we will issue a full refund — no questions asked. This applies to your first subscription period only.",
  },
    a: "Premium can still be worthwhile. Patterns can begin emerging from a small number of entries, and the weekly summary reflects whatever you have written, even if it was a lighter week.",
  },
  {
    q: "Will I be charged automatically every month?",
    a: "Yes. Premium renews monthly until you cancel. You can manage or cancel your subscription from Settings, and you keep access until the end of the paid period.",
  },
  {
    q: "Is my data safe and private?",
    a: "Yes. Your entries stay private, are never sold, never shared, and are never used to train AI models. Havenly is built around that principle.",
  },
  {
    q: "Why is Premium $30/month?",
    a: "Think of it this way: most journaling tools charge for cloud storage or prettier templates. Havenly charges for the AI layer that reads across weeks of entries and surfaces what you couldn't see from inside it. That work is genuinely expensive to run — and $30/month keeps it sustainable without ads or selling your data.",
  },
];

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-slate-950">
        {/* Stronger glow blobs */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.14] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-100px] top-20 h-72 w-72 rounded-full bg-cyan-500/[0.10] blur-[80px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-14 pt-12 sm:pb-18 sm:pt-16">
          <div className="max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
              Havenly Premium
            </p>

            <h1 className="mt-4 max-w-4xl text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.4rem]">
              Start seeing the deeper pattern,
              <br />
              <span className="text-emerald-400">not just today&apos;s entry.</span>
            </h1>

            <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-400 sm:text-[17px]">
              Premium adds the layer that connects your entries across time. Instead of
              only reflecting what you wrote today, Havenly starts showing what keeps
              repeating, what is shifting, and what may be underneath it.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/api/stripe/checkout"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:-translate-y-px sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Upgrade to Premium
              </Link>

              <Link
                href="/insights/preview"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-6 py-4 text-base font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Preview Premium insights
              </Link>
            </div>

            {/* Trust micro-signals */}
            <div className="mt-5 flex flex-col gap-2.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                $30 / month — less than one therapy session
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Secure checkout via Stripe
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── What changes with Premium ─────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950/95 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">

            {/* Left — feature grid */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
                What changes with Premium
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                The value is not more journaling.{" "}
                <span className="text-emerald-400">It is more understanding.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
                Free gives you a private space to write and a few reflections each month.
                Premium helps Havenly connect the dots across entries, so your journal
                becomes easier to learn from.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {premiumFeatures.map(({ title, body, accent, tag }) => (
                  <div
                    key={title}
                    className={`rounded-2xl border bg-white/[0.02] p-4 ${accent}`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${tag}`}>
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — premium pricing card */}
            <div className="rounded-[1.75rem] border border-emerald-500/25 bg-emerald-500/[0.04] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                    Premium
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                    The full picture, not just today&apos;s entry
                  </h3>
                </div>

                {/* ✅ Fixed: "Founding price" replaces "Early access" */}
                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Founding price
                </span>
              </div>

              {/* ✅ Price with therapy anchor on same row */}
              <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-4xl font-bold text-white">$30</span>
                <span className="pb-0.5 text-sm text-slate-400">/ month</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  Less than one therapy session
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-600">Cancel anytime · no questions asked</p>

              {/* Before / After contrast box */}
              <div className="mt-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-xs text-slate-400">
                <p>
                  <span className="text-slate-600">Before:</span>{" "}
                  &ldquo;I know something keeps happening, but I still cannot quite see what.&rdquo;
                </p>
                <p className="mt-1">
                  <span className="text-emerald-500/80">After:</span> Havenly shows what
                  repeats, how long it has been there, and what may be underneath it.
                </p>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                {[
                  {
                    label: "Everything in Free",
                    sub: "Nothing removed, just a deeper layer added",
                  },
                  {
                    label: "Unlimited reflections",
                    sub: "Reflect on every entry",
                  },
                  {
                    label: "Full hidden-pattern insights",
                    sub: "See what repeats across weeks and months",
                  },
                  {
                    label: "Weekly personal summary",
                    sub: "A written mirror of the week",
                  },
                  {
                    label: "\u201cWhy does this keep happening?\u201d insights",
                    sub: "A clearer view of recurring loops and emotional drivers",
                  },
                  {
                    label: "Cancel anytime",
                    sub: "No lock-in, no questions asked",
                  },
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

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/api/stripe/checkout"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
                >
                  Upgrade to Premium
                </Link>

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
          </div>
        </div>
      </section>

      {/* ── What Premium surfaces ─────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              What Premium starts surfacing
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              The patterns are easier to trust{" "}
              <span className="text-emerald-400">when you can finally see them.</span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insightExamples.map(({ label, text, labelClass, border }) => (
              <div key={label} className={`rounded-2xl border p-4 ${border}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelClass}`}>
                  {label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link
              href="/insights/preview"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              See a full example of Premium insights &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Free vs Premium comparison ────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950/95 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Free vs Premium
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Start free. Upgrade when you want the bigger picture.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Free helps you begin. Premium helps you understand what your entries mean
              together over time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-5">

            {/* Free card */}
            <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Free
              </p>
              <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                The perfect private place to start
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">$0</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>

              <p className="mt-3 text-sm text-slate-500">
                A calm place to write honestly, with no commitment, no pressure, and no audience.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                {[
                  { label: "Write anytime", sub: "Entries stay private" },
                  { label: "3 AI reflections to start", sub: "Enough to discover if this is for you" },
                  { label: "Gentle daily prompts", sub: "Helpful when you don't know how to begin" },
                  { label: "Basic pattern insights", sub: "A first layer of what keeps showing up" },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-emerald-600">✓</span>
                    <div>
                      <p>{label}</p>
                      <p className="text-xs text-slate-600">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  href="/magic-login"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                >
                  Start for free
                </Link>
                <p className="mt-2 text-center text-xs text-slate-700">
                  No credit card. No expiry.
                </p>
              </div>
            </div>

            {/* Premium card */}
            <div className="flex flex-col rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
                  Premium
                </p>
                {/* ✅ Fixed: "Founding price" replaces "Early access" */}
                <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Founding price
                </span>
              </div>

              <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                The deeper layer of understanding
              </p>

              {/* ✅ Therapy anchor next to price */}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl font-bold text-white">$30</span>
                <span className="text-sm text-slate-400">/ month</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  Less than one therapy session
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-300">
                For people who want clearer insight into what keeps repeating and why.
              </p>

              <ul className="mt-5 space-y-3 text-sm text-slate-200">
                {[
                  { label: "Unlimited reflections", sub: "Reflect on every entry" },
                  { label: "Full pattern insights", sub: "See what repeats across weeks and months" },
                  { label: "Weekly personal summary", sub: "A written mirror of the week" },
                  { label: "Why-this-keeps-happening insights", sub: "A clearer view of recurring emotional loops" },
                  { label: "Everything in Free", sub: "Nothing removed, just deeper" },
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
                  href="/api/stripe/checkout"
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
                >
                  Upgrade to Premium
                </Link>
                <Link
                  href="/insights/preview"
                  className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-900"
                >
                  Preview Premium insights
                </Link>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-center">
                <p className="text-xs font-medium text-slate-300">🛡️ 7-day full refund guarantee</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  Not what you expected? Email us within 7 days of your first charge — full refund, no questions asked.
                </p>
              </div>

              <p className="mt-3 text-center text-xs text-slate-700">
                Secure checkout via Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 bg-slate-950 py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            A few honest answers
          </h2>

          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-slate-800/60 pb-5">
                <p className="text-[15px] font-medium text-white sm:text-base">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{a}</p>
              </div>
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

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-14 sm:py-18">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-4xl">
            Something is trying to become clear.
            <br />
            <span className="text-emerald-400">Let&apos;s help you hear it.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Start with a single entry. When you want the deeper picture, Premium helps
            Havenly connect the dots.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/api/stripe/checkout"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-3.5 text-[15px] font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px sm:py-3 sm:text-sm"
            >
              Upgrade to Premium
            </Link>

            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-7 py-3.5 text-[15px] font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:py-3 sm:text-sm"
            >
              Start free first
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-700">
            Private by default · Entries never train AI models · 7-day refund guarantee
          </p>
        </div>
      </section>
    </div>
  );
}
