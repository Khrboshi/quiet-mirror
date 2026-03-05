// app/page.tsx
import Link from "next/link";
import dynamic from "next/dynamic";

const HomeBelowFold = dynamic(() => import("./(home)/HomeBelowFold"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-hvn-bg text-hvn-text-primary bg-hvn-page-gradient">

      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">

        {/* Ambient glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-emerald-500/[0.04] blur-3xl" />

        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center md:gap-16">

          <div className="max-w-lg space-y-7">

            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/70">
              Private · Calm · Yours
            </p>

            <h1 className="text-balance text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
              Finally understand<br />
              <span className="text-emerald-400">how you've really been.</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-400 sm:text-[17px]">
              Havenly is a private journal that notices what you keep coming
              back to -- and quietly reflects it back to you. No advice.
              No pressure. Just clarity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/magic-login"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                Start for free -- no card needed
              </Link>
              <Link
                href="/insights/preview"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-slate-900 transition-colors"
              >
                See how it works
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Your entries never train AI models
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Private by default, always
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Free plan, no expiry
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px] shrink-0">

            {/* Glow behind card */}
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-emerald-500/[0.06] blur-2xl" />

            <div className="relative rounded-3xl border border-white/[0.07] bg-slate-950/95 p-5 shadow-2xl shadow-black/60 backdrop-blur">

              {/* Card header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                  March 4 · Evening check-in
                </span>
                <span className="text-[10px] text-slate-700">Private · Just for you</span>
              </div>

              {/* Entry */}
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4">
                <p className="text-[13px] leading-relaxed text-slate-200">
                  "I keep saying I'm fine but I don't think I mean it anymore.
                  I'm tired in a way that sleep doesn't fix."
                </p>
              </div>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800/60" />
                <span className="text-[10px] text-slate-700 uppercase tracking-widest">Havenly noticed</span>
                <div className="h-px flex-1 bg-slate-800/60" />
              </div>

              {/* Reflection */}
              <div className="space-y-3">
                <p className="text-[13px] leading-relaxed text-slate-300">
                  This tiredness sounds like it's been building quietly for a
                  while -- not just this week, but longer. There's a difference
                  between being tired <em>from</em> things and being tired
                  <em> of</em> things.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-[11px] text-violet-300">Exhaustion</span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-300">Masking</span>
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">Quiet signal</span>
                </div>

                <p className="text-[12px] text-slate-500 italic">
                  What would it mean to stop saying you're fine -- just for today?
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 border-t border-slate-800/40 pt-3 text-[11px] text-slate-600">
                Patterns across 3 weeks of entries →
                <span className="ml-1 text-emerald-600">Curiosity · Communication · Clarity</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <HomeBelowFold />
    </div>
  );
}
