"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICING } from "@/app/lib/pricing";
import { REFLECTION } from "@/app/lib/copy";
import { PAYMENT } from "@/app/lib/payment";
import { CONFIG } from "@/app/lib/config";

// ─── FAQ data ───────────────────────────────────────────────────────────────
//
// All trial-length copy derives from PRICING — change trialDays in pricing.ts
// and this FAQ updates automatically.
//

const faqs = [
  {
    q: "What does Quiet Mirror actually show me with Premium?",
    a: "Premium unlocks the layer that reads across all your entries over time — not just the one you wrote today. You start seeing which emotional themes appear most often, how they connect to each other, what has been shifting, and why something may keep happening. The weekly summary pulls it all together into one personal read each week.",
  },
  {
    q: "How many reflections do I get on the free plan?",
    a: `Free includes ${PRICING.freeMonthlyCredits} AI reflections per month — enough to experience how Quiet Mirror works. Premium gives you unlimited reflections on every entry.`,
  },
  {
    q: "What is your refund policy?",
    // trialNoChargeUntil = "no charge until day 2/8" (always trialDays + 1)
    a: `Every new subscription starts with a ${PRICING.trialLabel} — ${PRICING.trialNoChargeUntil}. Cancel any time before then and you won't be charged anything. After the trial, if Premium is not what you expected, email ${CONFIG.supportEmail} and we will issue a full refund — no questions asked. This applies to your first subscription period only.`,
  },
  {
    q: "What if I do not write very often?",
    a: "Premium can still be worthwhile. Patterns can begin emerging from a small number of entries, and the weekly summary reflects whatever you have written, even if it was a lighter week.",
  },
  {
    q: "Will I be charged automatically every month?",
    a: "Yes. Premium renews monthly until you cancel. You can manage or cancel your subscription from Settings, and you keep access until the end of the paid period.",
  },
  {
    q: "Is my data safe and private?",
    a: `Yes. Your entries stay private, are never sold, never shared, and are never used to train AI models. ${CONFIG.appName} is built around that principle.`,
  },
  {
    q: `Why is Premium ${PRICING.monthlyCadence}?`,
    a: `Most journaling tools charge for cloud storage or prettier templates. ${CONFIG.appName} charges for the AI layer that reads across weeks of entries and surfaces what you couldn't see from inside it. That work is genuinely expensive to run — and ${PRICING.monthlyCadence} keeps it sustainable without ads or selling your data.`,
  },
];

// ─── Upgrade button ─────────────────────────────────────────────────────────

function UpgradeButton({
  className,
  // Default label derives from PRICING so it updates with trialDays automatically
  label = `Start ${PRICING.trialLabel}`,
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PAYMENT.checkoutApiRoute, { method: "POST" });
      if (res.status === 401) {
        router.push("/magic-login?next=/upgrade");
        return;
      }
      const data = await res.json();
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        setError(
          `Something went wrong — please try again or email ${CONFIG.supportEmail}.`,
        );
      }
    } catch {
      setError(
        `Something went wrong — please try again or email ${CONFIG.supportEmail}.`,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className={className}
      >
        {loading ? "Redirecting…" : label}
      </button>
      {error && (
        <p className="mt-2 text-center text-xs text-red-400">{error}</p>
      )}
    </>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero — with embedded proof card ──────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-800/60">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-emerald-500/[0.13] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-80px] top-24 h-72 w-72 rounded-full bg-cyan-500/[0.08] blur-[90px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-start lg:gap-14">
            {/* Left — copy + CTA */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
                {CONFIG.appName} Premium
              </p>

              <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.2rem]">
                Start seeing the deeper pattern,
                <br />
                <span className="text-emerald-400">
                  not just today&apos;s entry.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300 sm:text-[17px]">
                Premium connects your entries across time. Instead of only
                reflecting what you wrote today, {CONFIG.appName} starts showing
                what keeps repeating, what is shifting, and what may be
                underneath it.
              </p>

              {/* Feature list */}
              <ul className="mt-7 space-y-3">
                {[
                  {
                    label: "Unlimited reflections",
                    sub: "Reflect on every entry, not just a few each month",
                    color: "text-emerald-400",
                  },
                  {
                    label: "Full pattern insights",
                    sub: "See what repeats across weeks and months",
                    color: "text-violet-400",
                  },
                  {
                    label: "Weekly personal summary",
                    sub: "A written mirror of what Quiet Mirror noticed this week",
                    color: "text-amber-400",
                  },
                  {
                    label: "Why-this-keeps-happening insights",
                    sub: "Get closer to the recurring emotional loop underneath",
                    color: "text-violet-400",
                  },
                  {
                    label: "Everything in Free",
                    sub: REFLECTION.nothingRemoved,
                    color: "text-slate-500",
                  },
                ].map(({ label, sub, color }) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <span className={`mt-0.5 shrink-0 text-sm ${color}`}>✓</span>
                    <div>
                      <p className="font-medium text-slate-100">{label}</p>
                      <p className="text-xs text-slate-500">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Free vs Premium comparison */}
              <div className="mt-8 max-w-sm overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <div className="grid grid-cols-[1fr_auto_auto] border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  <span />
                  <span className="w-16 text-center">Free</span>
                  <span className="w-16 text-center text-emerald-400">
                    Premium
                  </span>
                </div>
                {[
                  { label: "Journal entries", free: "✓", premium: "✓" },
                  { label: "AI reflections", free: `${PRICING.freeMonthlyCredits} / mo`, premium: "Unlimited" },
                  { label: "Pattern insights", free: "—", premium: "✓" },
                  { label: "Weekly summary", free: "—", premium: "✓" },
                  { label: "Why-it-keeps-happening", free: "—", premium: "✓" },
                  { label: "Private & ad-free", free: "✓", premium: "✓" },
                ].map(({ label, free, premium }, i) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 text-sm ${
                      i % 2 === 0 ? "" : "bg-white/[0.015]"
                    }`}
                  >
                    <span className="text-slate-400">{label}</span>
                    <span
                      className={`w-16 text-center text-xs ${
                        free === "—" ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {free}
                    </span>
                    <span
                      className={`w-16 text-center text-xs font-medium ${
                        premium === "✓" || premium === "Unlimited"
                          ? "text-emerald-400"
                          : "text-slate-400"
                      }`}
                    >
                      {premium}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="mt-8">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-4xl font-bold text-white">
                    {PRICING.monthly}
                  </span>
                  <span className="text-sm text-slate-400">/ month</span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                    {PRICING.valueLabel}
                  </span>
                </div>
                <p className="mb-4 text-xs text-slate-600">
                  {PRICING.trialFreeFor} · then {PRICING.monthlyCadence} · Cancel
                  anytime
                </p>

                <div className="flex flex-col gap-2 sm:max-w-sm">
                  <UpgradeButton className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[color:var(--hvn-accent-mint-hover)] hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm" />

                  {/* Trust badge — all copy derives from PRICING */}
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-2.5 text-center">
                    <p className="text-xs font-medium text-slate-300">
                      {PRICING.trialLabel} — no charge today
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                      Try everything during your {PRICING.trialLabel}. Cancel
                      before then and you won&apos;t be charged.
                    </p>
                  </div>

                  <Link
                    href="/insights/preview"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-700/60 px-6 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                  >
                    Preview Premium insights first →
                  </Link>
                </div>

                <p className="mt-3 text-xs text-slate-700">
                  {PAYMENT.checkoutTrustLine}
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  By subscribing you agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-emerald-500 underline underline-offset-2 transition-colors hover:text-emerald-400"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-emerald-500 underline underline-offset-2 transition-colors hover:text-emerald-400"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Already free? */}
              <p className="mt-5 text-xs text-slate-600">
                Already using Free?{" "}
                <span className="text-slate-500">
                  Premium unlocks unlimited reflections, pattern insights,
                  weekly summaries, and the why-this-keeps-happening layer.
                </span>
              </p>
            </div>

            {/* Right — live proof card */}
            <div className="lg:sticky lg:top-6">
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-emerald-500/[0.07] blur-[60px]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-4" style={{ backgroundColor: "#0f121f" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
                    <p className="text-xs font-medium text-slate-500">
                      Your hidden pattern
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-400">
                    Premium insight
                  </span>
                </div>

                {/* Input side */}
                <div className="px-6 pb-5 pt-5" style={{ backgroundColor: "#141828" }}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    From your entries
                  </p>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Emotional load",
                        pct: 64,
                        color: "bg-emerald-400",
                      },
                      {
                        label: "Responsibility for others",
                        pct: 50,
                        color: "bg-emerald-500/60",
                      },
                      {
                        label: "Overwhelm / exhaustion",
                        pct: 45,
                        color: "bg-violet-400/70",
                      },
                      {
                        label: "Clarity (↑ rising)",
                        pct: 28,
                        color: "bg-violet-400/60",
                      },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {label}
                          </span>
                          <span className="text-xs text-slate-700">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div
                            className={`h-1.5 rounded-full ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-white">
                        14
                        <span className="text-sm font-normal text-slate-500">
                          /22
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        entries with
                        <br />
                        emotional load
                      </p>
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/60 px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-white">
                        3
                        <span className="text-sm font-normal text-slate-500">
                          wks
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        pattern has
                        <br />
                        been building
                      </p>
                    </div>
                  </div>
                </div>

                {/* Output side */}
                <div className="border-t border-emerald-500/10 bg-emerald-950/40 px-6 pb-6 pt-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-emerald-500/10" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500/60">
                      {CONFIG.appName} reflects
                    </span>
                    <div className="h-px flex-1 bg-emerald-500/10" />
                  </div>
                  <p className="text-[14px] leading-[1.7] text-slate-100">
                    You often sound most overwhelmed when you feel responsible
                    for{" "}
                    <span className="text-emerald-300">
                      keeping everything steady for everyone else
                    </span>{" "}
                    — and rarely give yourself the same patience.
                  </p>
                  <div className="mt-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] p-3">
                    <p className="text-xs leading-relaxed text-slate-400">
                      This pattern appeared in your last 3 weeks of entries. It
                      tends to peak on Sundays.
                    </p>
                  </div>
                  <p className="mt-4 text-[11px] text-emerald-500/30">
                    Only you can see this. Never shared, never used to train AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Premium surfaces ─────────────────────────────────────────── */}
      <section className="border-b border-slate-800/60 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
              What Premium starts surfacing
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              The patterns are easier to trust{" "}
              <span className="text-emerald-400">
                when you can finally see them.
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Across your entries, {CONFIG.appName} finds what keeps surfacing —
              the emotions, themes, and questions that repeat without you
              noticing.
            </p>
            <p className="mt-2 text-xs text-slate-600">
              The cards below are illustrative examples — yours will be built
              from your own entries.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — What shows up most */}
            <div className="rounded-[1.5rem] border border-violet-500/20 bg-violet-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                What shows up most
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-white">
                Emotional load appears in{" "}
                <span className="text-violet-300">14 of your last 22</span>{" "}
                entries.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Emotional load", pct: 64, color: "bg-violet-400" },
                  { label: "Overwhelm", pct: 45, color: "bg-violet-500/60" },
                  { label: "Clarity", pct: 28, color: "bg-violet-600/50" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs text-slate-600">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — What keeps returning */}
            <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                What keeps returning
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-white">
                Responsibility and communication are the{" "}
                <span className="text-emerald-300">
                  two themes most often linked
                </span>{" "}
                together.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Responsibility",
                    count: "11×",
                    color:
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                  },
                  {
                    label: "Communication",
                    count: "9×",
                    color:
                      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
                  },
                  {
                    label: "Boundary-setting",
                    count: "7×",
                    color:
                      "border-slate-600/40 bg-slate-800/50 text-slate-400",
                  },
                  {
                    label: "Exhaustion",
                    count: "6×",
                    color:
                      "border-slate-600/40 bg-slate-800/50 text-slate-400",
                  },
                ].map(({ label, count, color }) => (
                  <div
                    key={label}
                    className={`rounded-xl border px-3 py-2 ${color}`}
                  >
                    <p className="text-[11px] font-medium">{label}</p>
                    <p className="mt-0.5 text-xs opacity-70">
                      {count} this month
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — What may be driving it */}
            <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/[0.04] p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                What may be driving it
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                You often sound most overwhelmed when you feel responsible for{" "}
                <span className="text-amber-300">
                  keeping everything steady for everyone else
                </span>{" "}
                — and rarely give yourself the same patience.
              </p>
              <div className="mt-4 rounded-xl border border-amber-500/10 bg-amber-500/[0.04] p-3">
                <p className="text-xs leading-relaxed text-slate-400">
                  This pattern appeared in your last 3 weeks of entries. Tends
                  to peak on Sundays.
                </p>
              </div>
            </div>

            {/* Card 4 — What is shifting */}
            <div className="rounded-[1.5rem] border border-sky-500/20 bg-sky-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">
                What is shifting
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                Curiosity and honesty are{" "}
                <span className="text-sky-300">rising in recent entries</span> —
                which often signals that something important is becoming
                clearer.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="text-sky-400">↑</span>
                <span>Clarity signal up over the last 2 weeks</span>
              </div>
            </div>

            {/* Card 5 — Weekly mirror */}
            <div className="rounded-[1.5rem] border border-rose-500/20 bg-rose-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-400">
                Your weekly mirror
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-slate-200">
                This week, your entries returned most often to questions of
                worth, pace, and{" "}
                <span className="text-rose-300">
                  what you&apos;re actually allowed to need
                </span>
                .
              </p>
              <p className="mt-3 text-[11px] text-slate-500">
                Generated every Monday · Personal to your entries only
              </p>
            </div>

            {/* Card 6 — A question worth sitting with */}
            <div className="rounded-[1.5rem] border border-slate-500/20 bg-slate-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                A question worth sitting with
              </p>
              <p className="mt-3 text-lg font-medium leading-snug text-white">
                &ldquo;What keeps making you say you&apos;re fine before
                you&apos;ve had a chance to ask whether you are?&rdquo;
              </p>
              <p className="mt-3 text-xs text-slate-600">
                Generated from your last 6 entries. Not a prompt to answer —
                just something to carry.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/insights/preview"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
            >
              See a full example of Premium insights →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mid-page CTA ─────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/40 bg-emerald-500/[0.03] py-10">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="mb-4 font-display text-xl font-medium text-white sm:text-2xl">
            The pattern you&apos;ve been sensing is already there.
            <br />
            <span className="text-emerald-400">
              Premium helps you finally name it.
            </span>
          </p>
          <div className="flex flex-col items-center gap-2">
            <UpgradeButton className="inline-flex items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[color:var(--hvn-accent-mint-hover)] hover:-translate-y-px disabled:opacity-60" />
            <p className="text-xs text-slate-600">
              {PRICING.trialFreeFor} · then {PRICING.monthlyCadence} · Cancel
              anytime
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b bg-qm-card py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
            A few honest answers
          </h2>
          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-slate-800/60 pb-5">
                <p className="text-[15px] font-medium text-white sm:text-base">
                  {q}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
            <Link
              href="/terms"
              className="text-emerald-600 transition-colors hover:text-emerald-500"
            >
              Terms of Service →
            </Link>
            <Link
              href="/privacy"
              className="text-emerald-600 transition-colors hover:text-emerald-500"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-slate-800/60 py-20 sm:py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-4xl">
            Something is trying to become clear.
            <br />
            <span className="text-emerald-400">
              Let&apos;s help you hear it.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Start with a single entry. When you want the deeper picture, Premium
            helps {CONFIG.appName} connect the dots.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <UpgradeButton
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-7 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[color:var(--hvn-accent-mint-hover)] hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm"
              label={`Start ${PRICING.trialLabel} →`}
            />
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full border border-slate-700/60 px-7 py-4 text-base font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:py-3.5 sm:text-sm"
            >
              Start free first
            </Link>
          </div>
          <p className="mt-5 text-xs text-slate-700">
            {PRICING.trialFreeFor} · No charge today · Cancel anytime · No ads,
            ever
          </p>
        </div>
      </section>
    </div>
  );
}
