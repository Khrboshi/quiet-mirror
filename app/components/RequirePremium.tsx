"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslation } from "@/app/components/I18nProvider";
import { useUserPlan } from "@/app/components/useUserPlan";
import { PRICING } from "@/app/lib/pricing";

interface RequirePremiumProps {
  children: ReactNode;
}

export default function RequirePremium({ children }: RequirePremiumProps) {
  const { t } = useTranslation();
  const rp = t.requirePremium;
  const ps = t.pricingStrings;
  const { loading, planType } = useUserPlan();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-qm-bg">
        <div className="flex items-center gap-3 rounded-full border border-qm-subtle bg-qm-card px-4 py-2 text-sm text-qm-secondary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-qm-accent" />
          <span>Checking your plan…</span>
        </div>
      </div>
    );
  }

  const isPremium = planType === "PREMIUM" || planType === "TRIAL";

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-qm-bg px-4 py-12 text-qm-primary">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* Main card */}
          <div className="qm-panel rounded-[1.75rem] p-7 shadow-qm-soft sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-qm-accent bg-qm-accent-soft px-3 py-1 text-xs font-semibold text-qm-accent">
              ✦ Premium feature
            </span>

            <h1 className="font-display mt-5 text-2xl font-semibold leading-snug text-qm-primary sm:text-3xl">
              You&apos;ve been writing honestly.
              <br />
              <span className="text-qm-accent">
                This is where the deeper picture starts.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-qm-secondary">
              This feature is part of Premium — the layer that reads across your
              entries over time and shows you what keeps repeating, what&apos;s
              shifting, and what may be underneath it.
            </p>

            {/* What Premium unlocks */}
            <div className="mt-6 space-y-3">
              {[
                {
                  label: rp.f1Label,
                  sub: rp.f1Sub,
                  dot: "bg-qm-accent",
                },
                {
                  label: rp.f2Label,
                  sub: rp.f2Sub,
                  dot: "bg-qm-premium",
                },
                {
                  label: rp.f3Label,
                  sub: rp.f3Sub,
                  dot: "bg-qm-warning",
                },
                {
                  label: rp.f4Label,
                  sub: rp.f4Sub,
                  dot: "bg-qm-premium",
                },
              ].map(({ label, sub, dot }) => (
                <div key={label} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-qm-primary">
                      {label}
                    </p>
                    <p className="text-xs text-qm-muted">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="mt-7 qm-panel rounded-xl p-5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-display text-3xl font-bold text-qm-primary">
                  {PRICING.monthly}
                </span>
                <span className="text-sm text-qm-secondary">/ month</span>
                <span className="rounded-full border border-qm-accent bg-qm-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-qm-accent">
                  {ps.valueLabel(PRICING.trialDays)}
                </span>
              </div>

              <p className="mt-1 text-xs text-qm-muted">
                {ps.trialFreeFor(PRICING.trialDays)} · {ps.thenPerMonth(ps.perMonth(PRICING.monthly))} · {t.upgrade.cancelAnytime}
              </p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href="/upgrade"
                  className="inline-flex items-center justify-center rounded-full qm-btn-primary px-6 py-3 text-sm"
                >
                  {ps.startTrialCta(ps.trialLabel(PRICING.trialDays))}
                </Link>
                <Link
                  href="/insights/preview"
                  className="inline-flex items-center justify-center rounded-full qm-btn-secondary px-5 py-3 text-sm"
                >
                  Preview what Premium shows
                </Link>
              </div>
            </div>
          </div>

          {/* Soft exit — no pressure */}
          <div className="qm-panel rounded-2xl px-6 py-5">
            <p className="text-sm leading-relaxed text-qm-secondary">
              {rp.noPressure(PRICING.freeMonthlyCredits)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/journal"
                className="text-sm font-medium text-qm-accent transition-colors hover:opacity-80"
              >
                ← Continue journaling free
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-qm-muted transition-colors hover:text-qm-secondary"
              >
                Go to dashboard
              </Link>
            </div>
          </div>

          {/* Trust line */}
          <p className="text-center text-xs text-qm-faint">
            Your entries are private, never shared, and never used to train AI
            models.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
