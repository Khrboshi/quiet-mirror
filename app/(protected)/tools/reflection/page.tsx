// app/(protected)/tools/reflection/page.tsx
"use client";

export const dynamic = "force-dynamic";

import RequirePremium from "@/app/components/RequirePremium";
import Link from "next/link";

export default function ReflectionToolPage() {
  return (
    <RequirePremium>
      <div className="min-h-screen w-full bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80">
              Coming soon
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">
              Guided Reflection
            </h1>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xl">
              A prompt shaped around what has been showing up in your entries lately —
              not a generic question, but something that fits where you actually are.
            </p>
          </header>

          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-6 space-y-3">
            <p className="text-sm font-medium text-slate-200">What this will be</p>
            <p className="text-sm leading-relaxed text-slate-400">
              Havenly will read across your recent entries and offer one focused reflection question —
              something worth sitting with. It will not summarise or diagnose.
              Just a quiet question that opens something up.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <p className="text-sm leading-relaxed text-slate-400">
              Your Insights page already shows patterns across your entries.
              That is a good place to start while this tool is being built.
            </p>
            <Link
              href="/insights"
              className="mt-4 inline-flex items-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              See your insights
            </Link>
          </div>

          <footer className="flex items-center justify-between pt-2">
            <Link href="/tools" className="text-sm text-emerald-400 hover:text-emerald-300">
              ← Back to Tools
            </Link>
            <Link href="/journal" className="text-sm text-slate-400 hover:text-white">
              Go to journal
            </Link>
          </footer>
        </div>
      </div>
    </RequirePremium>
  );
}
