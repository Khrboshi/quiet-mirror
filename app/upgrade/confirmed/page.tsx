// app/upgrade/confirmed/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PRICING } from "@/app/lib/pricing";
import { CONFIG } from "@/app/lib/config";
import { getRequestTranslations } from "@/app/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getRequestTranslations();
  return {
    title: t.upgradeConfirmed.metaTitle(CONFIG.appName),
  };
}

export default async function UpgradeConfirmedPage() {
  const t = await getRequestTranslations();
  const uc = t.upgradeConfirmed;
  const ps = t.pricingStrings;
  const pf = t.premiumFeatures;

  const features = [
    { label: pf.f1Label, sub: pf.f1Sub, color: "text-qm-positive" },
    { label: pf.f2Label, sub: pf.f2Sub, color: "text-qm-premium" },
    { label: pf.f3Label, sub: pf.f3Sub, color: "text-qm-warning" },
    { label: pf.f4Label, sub: pf.f4Sub, color: "text-qm-premium" },
  ];

  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">

      {/* Glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-qm-positive-strong/[0.10] blur-[130px]" />

      <main className="relative mx-auto max-w-2xl px-6 pb-20 pt-24 sm:pt-32">

        {/* Icon */}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-qm-positive-border bg-qm-positive-soft shadow-lg">
            <svg className="h-6 w-6 text-qm-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center font-display text-3xl font-semibold leading-snug text-qm-primary sm:text-4xl">
          {uc.headline1}
          <br />
          <span className="text-qm-positive">{uc.headline2}</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-center text-[15px] leading-relaxed text-qm-muted">
          {uc.subDesc(CONFIG.appName, ps.trialFreeFor(PRICING.trialDays))}
        </p>

        {/* What just unlocked */}
        <div className="mt-10 rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.04] p-6 sm:p-7">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
            {uc.whatUnlocked}
          </p>
          <ul className="space-y-4">
            {features.map(({ label, sub, color }) => (
              <li key={label} className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${color}`}>✓</span>
                <div>
                  <p className="text-sm font-medium text-qm-primary">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-qm-faint">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm leading-relaxed text-qm-faint">
          {uc.patternsNote(CONFIG.appName)}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/journal/new"
            className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px sm:py-3.5 sm:text-sm"
          >
            {uc.ctaWrite}
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-7 py-4 text-base font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary sm:py-3.5 sm:text-sm"
          >
            {uc.ctaInsights}
          </Link>
        </div>

        {/* Billing note */}
        <p className="mt-8 text-center text-xs text-qm-faint">
          {uc.dashboardDelay}{" "}
          <Link href="/dashboard" className="text-qm-faint underline underline-offset-2 hover:text-qm-secondary">{uc.refreshOnce}</Link>
          .{" "}
          <Link href="/settings/billing" className="text-qm-faint underline underline-offset-2 hover:text-qm-secondary">{uc.manageBilling}</Link>
        </p>

        {/* Trial badge */}
        <div className="mt-6 rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.04] px-6 py-4 text-center">
          <p className="text-xs font-medium text-qm-positive">
            🛡️ {ps.trialLabel(PRICING.trialDays)} — {ps.noChargeToday}
          </p>
          <p className="mt-1.5 text-xs text-qm-faint">
            {ps.perMonth(PRICING.monthly)} begins after your trial ends. {ps.cancelAnytimeLong} in{" "}
            <Link href="/settings/billing" className="text-qm-muted underline underline-offset-2 hover:text-qm-secondary">
              {uc.billingSettings}
            </Link>
            {" "}{uc.billingNote}
          </p>
        </div>

      </main>
    </div>
  );
}
