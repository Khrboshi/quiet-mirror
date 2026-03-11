import Link from "next/link";
import HomeBelowFold from "./(home)/HomeBelowFold";

export const metadata = {
  title: "Havenly — The Journal That Listens",
  description:
    "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning. Free to start.",
  openGraph: {
    title: "Havenly — The Journal That Listens",
    description:
      "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning.",
    url: "https://havenly-2-1.vercel.app/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hvn-bg bg-hvn-hero-gradient text-hvn-text-primary">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-14 md:pb-28 md:pt-20">

        {/* Glow layers */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.12] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-cyan-500/[0.08] blur-[90px]" />

        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] md:items-center md:gap-14">

          {/* ─── LEFT — Copy ──────────────────────────────────────────── */}
          <div className="max-w-xl">

            {/* 5-second definition pill */}
            <div className="animate-fade-in anim-delay-0 mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Private AI journaling · Write → Reflect → See patterns
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up anim-delay-100 font-display text-[2.35rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-[3.4rem]">
              You&apos;ve been carrying this{" "}
              <br className="hidden sm:block" />
              <em className="not-italic text-emerald-400">for a while now.</em>
            </h1>

            {/* What it is — clear one-liner */}
            <p className="animate-fade-in-up anim-delay-200 mt-5 text-base leading-relaxed text-slate-300 sm:text-[17px]">
              Havenly is a private journal that reads what you write and{" "}
              <span className="text-slate-200">gently reflects it back</span> —
              then, over time, shows you the patterns you&apos;ve been too close
              to see.
            </p>

            {/* Mirror quote */}
            <blockquote className="animate-fade-in-up anim-delay-300 mt-5 border-l-2 border-emerald-500/30 pl-4">
              <p className="text-sm italic leading-relaxed text-slate-400">
                &ldquo;You&apos;ve been saying &lsquo;I&apos;m fine&rsquo; for
                so long, you&apos;ve started to believe it.&rdquo;
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Sound familiar? That&apos;s what Havenly is for.
              </p>
            </blockquote>

            {/* CTAs */}
            <div className="animate-fade-in-up anim-delay-400 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:-translate-y-px hover:shadow-emerald-400/40 sm:py-3.5 sm:text-sm"
              >
                Write your first entry free →
              </Link>
              <Link
                href="/insights/preview"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-6 py-4 text-base font-medium text-slate-400 transition-colors hover:border-slate-500 hover:text-white sm:py-3.5 sm:text-sm"
              >
                See a real reflection →
              </Link>
            </div>

            {/* Promise strip */}
            <div className="animate-fade-in anim-delay-500 mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs text-slate-500">
              ✓&nbsp;Journal in under 60 seconds &nbsp;·&nbsp; ✓&nbsp;First
              reflection within moments &nbsp;·&nbsp; ✓&nbsp;No setup, no quiz
            </div>

            {/* Trust signals */}
            <div className="animate-fade-in anim-delay-600 mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
              {[
                "Private by default",
                "Entries never train AI models",
                "Free plan, no expiry",
                "2,400+ quiet writers",
              ].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* ─── RIGHT — Product preview ──────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-emerald-500/[0.09] blur-[80px]" />

            <div className="animate-fade-in anim-delay-300 relative overflow-hidden rounded-[2rem] border border-white/[0.10] bg-slate-950/95 shadow-2xl shadow-black/70 backdrop-blur">

              {/* Card header */}
              <div className="border-b border-slate-800/70 px-6 py-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
                  Evening check-in
                </span>
                <span className="rounded-full border border-slate-700/50 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                  Private · Just for you
                </span>
              </div>

              <div className="p-6">
                {/* What you wrote label */}
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                  What you wrote
                </p>

                {/* User entry */}
                <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                  <p className="text-sm leading-relaxed text-slate-300">
                    &ldquo;I keep telling people I&apos;m okay, but lately even
                    small things feel heavier than they should.&rdquo;
                  </p>
                </div>

                {/* Divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-800/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500/60">
                    Havenly reflects
                  </span>
                  <div className="h-px flex-1 bg-slate-800/60" />
                </div>

                {/* Reflection */}
                <p className="text-[15px] leading-[1.7] text-slate-100">
                  It sounds like you&apos;ve been carrying more than you&apos;ve
                  let yourself name. This doesn&apos;t read like one bad day —
                  it reads like a weight that&apos;s been building quietly.
                </p>

                {/* Signal tags */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { label: "Emotional load", color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" },
                    { label: "Masking", color: "border-violet-500/20 bg-violet-500/10 text-violet-300" },
                    { label: "Burnout signal", color: "border-amber-500/20 bg-amber-500/10 text-amber-300" },
                  ].map(({ label, color }) => (
                    <span
                      key={label}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${color}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Footer note */}
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-[11px] text-slate-700">
                    Never leaves your account.
                  </p>
                  <Link
                    href="/insights/preview"
                    className="text-[11px] font-medium text-emerald-600 transition-colors hover:text-emerald-400"
                  >
                    See full example →
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <HomeBelowFold />
    </div>
  );
}
