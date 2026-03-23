"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useUserPlan } from "@/app/components/useUserPlan";
import { PRICING } from "@/app/lib/pricing";

interface RequirePremiumProps {
  children: ReactNode;
}

export default function RequirePremium({ children }: RequirePremiumProps) {
  const { loading, planType } = useUserPlan();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Checking your plan…</span>
        </div>
      </div>
    );
  }

  const isPremium = planType === "PREMIUM" || planType === "TRIAL";

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Main card */}
          <div className="rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/[0.03] p-7 shadow-xl shadow-black/30 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              ✦ Premium feature
            </span>

            <h1 className="font-display mt-5 text-2xl font-semibold leading-snug text-white sm:text-3xl">
              You&apos;ve been writing honestly.
              <br />
              <span className="text-emerald-400">
                This is where the deeper picture starts.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-300">
              This feature is part of Premium — the layer that reads across your
              entries over time and shows you what keeps repeating, what&apos;s
              shifting, and what may be underneath it.
            </p>

            {/* What Premium unlocks */}
            <div className="mt-6 space-y-3">
              {[
                {
                  label: "Unlimited reflections",
                  sub: "Reflect on every entry, not just a few each month",
                  dot: "bg-emerald-400",
                },
                {
                  label: "Pattern insights across time",
                  sub: "See what themes and emotions keep surfacing",
                  dot: "bg-violet-400",
                },
                {
                  label: "Weekly personal summary",
                  sub: "A concise mirror of what Havenly noticed this week",
                  dot: "bg-amber-400",
                },
                {
                  label: "Why-this-keeps-happening insights",
                  sub: "Understand the recurring loops underneath your entries",
                  dot: "bg-sky-400",
                },
              ].map(({ label, sub, dot }) => (
                <div key={label} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {label}
                    </p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="mt-7 rounded-xl border border-emerald-500/15 bg-slate-950/50 p-5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-display text-3xl font-bold text-white">
                  {PRICING.monthly}
                </span>
                <span className="text-sm text-slate-400">/ month</span>
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  {PRICING.valueLabel}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-600">
                Free for 7 days · then {PRICING.monthlyCadence} · Cancel anytime
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
                >
                  Start 7-day free trial →
                </Link>
                <Link
                  href="/insights/preview"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                >
                  Preview what Premium shows
                </Link>
              </div>
            </div>
          </div>

          {/* Soft exit — no pressure */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-5">
            <p className="text-sm leading-relaxed text-slate-400">
              No pressure to upgrade. Free includes 3 reflections per month and
              full journaling — enough to keep writing honestly at your own
              pace.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/journal"
                className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                ← Continue journaling free
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-slate-500 transition-colors hover:text-slate-300"
              >
                Go to dashboard
              </Link>
            </div>
          </div>

          {/* Trust line */}
          <p className="text-center text-xs text-slate-700">
            Your entries are private, never shared, and never used to train AI
            models.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
