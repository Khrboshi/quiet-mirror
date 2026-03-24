import Link from "next/link";
import { PRICING } from "@/app/lib/pricing";
import { CONFIG } from "@/app/lib/config";

export const metadata = { title: `Welcome to Premium | ${CONFIG.appName}` };

export default function UpgradeConfirmedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Glow */}
      <div className="pointer-events-none fixed left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.10] blur-[130px]" />

      <main className="relative mx-auto max-w-2xl px-6 pb-20 pt-24 sm:pt-32">

        {/* Icon */}
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10">
            <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center font-display text-3xl font-semibold leading-snug text-white sm:text-4xl">
          Your trial has started.
          <br />
          <span className="text-emerald-400">The deeper layer is open.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-center text-[15px] leading-relaxed text-slate-400">
          Havenly will now read across your entries over time — not just today&apos;s. The
          patterns, the weekly mirror, and the why-this-keeps-happening layer are all yours
          for the next 7 days, and beyond if you choose to stay.
        </p>

        {/* What just unlocked */}
        <div className="mt-10 rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/[0.04] p-6 sm:p-7">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500/70">
            What just unlocked
          </p>
          <ul className="space-y-4">
            {[
              {
                label: "Unlimited reflections",
                sub: "Reflect on every entry — no monthly limit.",
                color: "text-emerald-400",
              },
              {
                label: "Full pattern insights",
                sub: "See what keeps surfacing across weeks and months.",
                color: "text-violet-400",
              },
              {
                label: "Weekly personal summary",
                sub: "Every Monday, a written mirror of what Havenly noticed.",
                color: "text-amber-400",
              },
              {
                label: "Why-this-keeps-happening insights",
                sub: "The recurring emotional loop underneath — named, gently.",
                color: "text-sky-400",
              },
            ].map(({ label, sub, color }) => (
              <li key={label} className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${color}`}>✓</span>
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Soft note */}
        <p className="mt-6 text-center text-sm leading-relaxed text-slate-500">
          The patterns become clearer the more you write. You don&apos;t need to do anything
          differently — just keep writing honestly, and Havenly does the noticing.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/journal/new"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-7 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px sm:py-3.5 sm:text-sm"
          >
            Write your next entry →
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-7 py-4 text-base font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:py-3.5 sm:text-sm"
          >
            See your insights
          </Link>
        </div>

        {/* Billing note */}
        <p className="mt-8 text-center text-xs text-slate-700">
          Your dashboard may take up to 30 seconds to reflect your new plan. If it doesn&apos;t
          update,{" "}
          <Link href="/dashboard" className="text-slate-600 underline underline-offset-2 hover:text-slate-500">
            refresh once
          </Link>
          .{" "}
          <Link
            href="/settings/billing"
            className="text-slate-600 underline underline-offset-2 hover:text-slate-500"
          >
            Manage billing →
          </Link>
        </p>

        {/* Trial + billing note */}
        <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] px-6 py-4 text-center">
          <p className="text-xs font-medium text-emerald-400">
            🛡️ Your 7-day free trial has started — no charge today
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            {PRICING.monthlyCadence} begins after your trial ends. Cancel any time before then in{" "}
            <Link href="/settings/billing" className="text-slate-400 underline underline-offset-2 hover:text-slate-300">
              billing settings
            </Link>
            {" "}and you won&apos;t be charged anything.
          </p>
        </div>

      </main>
    </div>
  );
}
