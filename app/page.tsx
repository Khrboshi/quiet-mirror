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
      <section className="relative overflow-hidden pb-14 pt-10 sm:pb-20 sm:pt-16 md:pb-28 md:pt-20">

        {/* Glow layers */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.14] blur-[100px]" />
        <div className="pointer-events-none absolute right-[-60px] top-20 h-64 w-64 rounded-full bg-cyan-500/[0.10] blur-[80px]" />

        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] md:items-center md:gap-12">

          {/* ─────────── LEFT — Copy ─────────── */}
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <p className="animate-fade-in anim-delay-0 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-400/80">
              The journal that reads between your lines
            </p>

            {/* Headline */}
            <h1 className="animate-fade-in-up anim-delay-100 mt-4 font-display text-[2.4rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl md:text-[3.55rem]">
              You&apos;ve been carrying this{" "}
              <br className="hidden sm:block" />
              <em className="not-italic text-emerald-400">for a while now.</em>
            </h1>

            {/* Sub-headline — tightened to 3 punchy sentences */}
            <p className="animate-fade-in-up anim-delay-200 mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400 sm:text-[17px]">
              Write what&apos;s on your mind. Get a reflection that names what
              your words are carrying. Over time, see what keeps returning.
            </p>

            {/* Mirror quote — UNIQUE, not duplicated below */}
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
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/40 hover:-translate-y-px sm:px-6 sm:py-3.5 sm:text-sm"
              >
                Write your first entry free →
              </Link>

              <Link
                href="/insights/preview"
                className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-6 py-4 text-base font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:px-6 sm:py-3.5 sm:text-sm"
              >
                See what a reflection actually looks like →
              </Link>
            </div>

            {/* Instant-value promise strip */}
            <div className="animate-fade-in anim-delay-500 mt-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs text-slate-500">
              ✓&nbsp;Journal in under 60 seconds &nbsp;·&nbsp; ✓&nbsp;First
              reflection within moments &nbsp;·&nbsp; ✓&nbsp;No setup, no quiz
            </div>

            {/* Trust signals */}
            <div className="animate-fade-in anim-delay-600 mt-5 flex flex-col gap-2.5 text-xs text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Private by default
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Entries never train AI models
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Free plan, no expiry
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Trusted by 2,400+ quiet writers
              </span>
            </div>
          </div>

          {/* ─────────── RIGHT — Product preview card (simplified) ─────────── */}
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-emerald-500/[0.10] blur-[80px]" />

            <div className="animate-fade-in anim-delay-300 relative overflow-hidden rounded-[2rem] border border-white/[0.10] bg-slate-950/95 p-6 shadow-2xl shadow-black/70 backdrop-blur">

              {/* Card header */}
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
                  Evening check-in
                </span>
                <span className="text-[11px] text-slate-600">
                  Private · Just for you
                </span>
              </div>

              {/* User entry */}
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/70 p-4">
                <p className="text-sm leading-relaxed text-slate-200">
                  &ldquo;I keep telling people I&apos;m okay, but lately even
                  small things feel heavier than they should.&rdquo;
                </p>
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800/60" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Havenly reflects
                </span>
                <div className="h-px flex-1 bg-slate-800/60" />
              </div>

              {/* Reflection — one clear paragraph, no nested boxes */}
              <p className="text-[15px] leading-relaxed text-slate-100">
                It sounds like you&apos;ve been carrying more than you&apos;ve
                let yourself name. This doesn&apos;t read like one bad day — it
                reads like a weight that&apos;s been building quietly.
              </p>

              {/* Signal tags */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-300">
                  Emotional load
                </span>
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-300">
                  Masking
                </span>
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                  Burnout signal
                </span>
              </div>

              {/* Privacy footnote */}
              <p className="mt-5 text-center text-[11px] text-slate-700">
                This entry is private and never leaves your account.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeBelowFold />
    </div>
  );
}
