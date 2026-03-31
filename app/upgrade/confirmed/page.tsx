// app/upgrade/confirmed/page.tsx
import Link from "next/link";
import { PRICING } from "@/app/lib/pricing";
import { CONFIG } from "@/app/lib/config";

export const metadata = { title: `Welcome to Premium | ${CONFIG.appName}` };

export default function UpgradeConfirmedPage() {
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
          Your trial has started.
          <br />
          <span className="text-qm-positive">The deeper layer is open.</span>
        </h1>

        {/* PRICING.trialDays drives "the next X days" — change one number in pricing.ts */}
        <p className="mx-auto mt-5 max-w-md text-center text-[15px] leading-relaxed text-qm-muted">
          {CONFIG.appName} will now read across your entries over time — not just today&apos;s. The
          patterns, the weekly mirror, and the why-this-keeps-happening layer are all yours
          for the next {PRICING.trialDays} days, and beyond if you choose to stay.
        </p>

        {/* What just unlocked */}
        <div className="mt-10 rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.04] p-6 sm:p-7">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
            What just unlocked
          </p>
          <ul className="space-y-4">
            {[
              { label: "Unlimited reflections", sub: "Reflect on every entry — no monthly limit.", color: "text-qm-positive" },
              { label: "Full pattern insights", sub: "See what keeps surfacing across weeks and months.", color: "text-qm-premium" },
              { label: "Weekly personal summary", sub: "Every Monday, a written mirror of what Quiet Mirror noticed.", color: "text-qm-warning" },
              { label: "Why-this-keeps-happening insights", sub: "The recurring emotional loop underneath — named, gently.", color: "text-qm-premium" },
            ].map(({ label, sub, color }) => (
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
          The patterns become clearer the more you write. You don&apos;t need to do anything
          differently — just keep writing honestly, and {CONFIG.appName} does the noticing.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/journal/new"
            className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px sm:py-3.5 sm:text-sm"
          >
            Write your next entry →
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-7 py-4 text-base font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary sm:py-3.5 sm:text-sm"
          >
            See your insights
          </Link>
        </div>

        {/* Billing note */}
        <p className="mt-8 text-center text-xs text-qm-faint">
          Your dashboard may take up to 30 seconds to reflect your new plan. If it doesn&apos;t
          update,{" "}
          <Link href="/dashboard" className="text-qm-faint underline underline-offset-2 hover:text-qm-secondary">refresh once</Link>
          .{" "}
          <Link href="/settings/billing" className="text-qm-faint underline underline-offset-2 hover:text-qm-secondary">Manage billing →</Link>
        </p>

        {/* Trial badge — all copy derives from PRICING */}
        <div className="mt-6 rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.04] px-6 py-4 text-center">
          <p className="text-xs font-medium text-qm-positive">
            🛡️ Your {PRICING.trialLabel} has started — no charge today
          </p>
          <p className="mt-1.5 text-xs text-qm-faint">
            {PRICING.monthlyCadence} begins after your trial ends. Cancel any time before then in{" "}
            <Link href="/settings/billing" className="text-qm-muted underline underline-offset-2 hover:text-qm-secondary">
              billing settings
            </Link>
            {" "}and you won&apos;t be charged anything.
          </p>
        </div>

      </main>
    </div>
  );
}
