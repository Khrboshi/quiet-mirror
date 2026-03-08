// app/page.tsx
import Link from "next/link";
import HomeBelowFold from "./(home)/HomeBelowFold";

export const metadata = {
  title: "Havenly - Stop Carrying It All in Your Head",
  description:
    "The private journal that listens, remembers, and helps you connect the dots. No advice, no noise - just clarity. Free to start.",
  openGraph: {
    title: "Havenly - Stop Carrying It All in Your Head",
    description:
      "The private journal that listens, remembers, and helps you connect the dots. Free to start.",
    url: "https://havenly-2-1.vercel.app/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hvn-bg bg-hvn-page-gradient text-hvn-text-primary">
      <section className="relative overflow-hidden pb-10 pt-12 sm:pb-16 sm:pt-20 md:pb-28 md:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/[0.05] blur-3xl sm:h-[500px] sm:w-[800px]" />

        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 md:flex-row md:items-center md:gap-16">
          <div className="space-y-5 md:max-w-lg md:space-y-7">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              Private &middot; Calm &middot; Yours
            </p>

            <h1 className="text-[2.25rem] font-semibold leading-[1.12] tracking-tight sm:text-5xl">
              Stop carrying it all{" "}
              <span className="text-emerald-400">in your head.</span>
            </h1>

            <p className="text-[15px] leading-relaxed text-slate-400 sm:text-[17px]">
              The private journal that listens, remembers, and helps you
              connect the dots. No advice. No noise. Just clarity &mdash; at
              your own pace.
            </p>

            <div className="flex flex-col gap-3 pt-1 sm:hidden">
              <Link
                href="/magic-login"
                className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-400"
              >
                Start free &mdash; no card needed
              </Link>
              <p className="text-center text-xs text-slate-600">
                Free forever &middot; Private by default &middot; No AI training
              </p>
            </div>

            <div className="hidden pt-1 sm:flex sm:flex-row sm:items-center sm:gap-3">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
              >
                Start free &mdash; no card needed
              </Link>
              <Link
                href="/insights/preview"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900"
              >
                See how it works
              </Link>
            </div>

            <div className="hidden text-xs text-slate-600 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1.5">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Your entries never train AI models
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Private by default, always
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                Free plan, no expiry
              </span>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-[360px] shrink-0 md:block">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-emerald-500/[0.06] blur-2xl" />

            <div className="relative rounded-3xl border border-white/[0.07] bg-slate-950/95 p-5 shadow-2xl shadow-black/60 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  March 4 &middot; Evening check-in
                </span>
                <span className="text-[10px] text-slate-700">
                  Private &middot; Just for you
                </span>
              </div>

              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[13px] leading-relaxed text-slate-200">
                  &ldquo;I keep saying I&apos;m fine but I don&apos;t think I
                  mean it anymore. I&apos;m tired in a way that sleep
                  doesn&apos;t fix.&rdquo;
                </p>
              </div>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800/60" />
                <span className="text-[10px] uppercase tracking-widest text-slate-700">
                  Havenly noticed
                </span>
                <div className="h-px flex-1 bg-slate-800/60" />
              </div>

              <div className="space-y-3">
                <p className="text-[13px] leading-relaxed text-slate-300">
                  This tiredness sounds like it&apos;s been building quietly for
                  a while &mdash; not just this week, but longer. There&apos;s a
                  difference between being tired <em>from</em> things and being
                  tired <em>of</em> things.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-300">
                    Exhaustion
                  </span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-300">
                    Masking
                  </span>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                    Quiet signal
                  </span>
                </div>

                <p className="text-[12px] italic text-slate-500">
                  What would it mean to stop saying you&apos;re fine &mdash;
                  just for today?
                </p>
              </div>

              <div className="mt-4 border-t border-slate-800/40 pt-3 text-[11px] text-slate-600">
                Patterns across 3 weeks &rarr;
                <span className="ml-1 text-emerald-600">
                  Curiosity &middot; Communication &middot; Clarity
                </span>
              </div>
            </div>
          </div>

          <div className="-mt-2 rounded-2xl border border-slate-800/40 bg-slate-900/30 p-4 sm:hidden">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-slate-600">
              What Havenly notices
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <p className="text-[13px] leading-snug text-slate-400">
                  <span className="text-slate-200">Curiosity</span> showing up
                  14 times this month
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <p className="text-[13px] leading-snug text-slate-400">
                  <span className="text-slate-200">Communication</span> in 10 of
                  your last 15 entries
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                <p className="text-[13px] leading-snug italic text-slate-400">
                  &ldquo;You&apos;re trying to make sense of the moment while
                  protecting your self-respect.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HomeBelowFold />
    </div>
  );
}
