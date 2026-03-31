"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICING } from "@/app/lib/pricing";
import { useTranslation } from "@/app/components/I18nProvider";
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
        <p className="mt-2 text-center text-xs text-qm-danger">{error}</p>
      )}
    </>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero — with embedded proof card ──────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-qm-border-subtle">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-qm-positive-strong/[0.13] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-80px] top-24 h-72 w-72 rounded-full bg-cyan-500/[0.08] blur-[90px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-start lg:gap-14">
            {/* Left — copy + CTA */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
                {CONFIG.appName} Premium
              </p>

              <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.2rem]">
                Start seeing the deeper pattern,
                <br />
                <span className="text-qm-positive">
                  not just today&apos;s entry.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
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
                    color: "text-qm-positive",
                  },
                  {
                    label: "Full pattern insights",
                    sub: "See what repeats across weeks and months",
                    color: "text-qm-premium",
                  },
                  {
                    label: "Weekly personal summary",
                    sub: "A written mirror of what Quiet Mirror noticed this week",
                    color: "text-qm-warning",
                  },
                  {
                    label: "Why-this-keeps-happening insights",
                    sub: "Get closer to the recurring emotional loop underneath",
                    color: "text-qm-premium",
                  },
                  {
                    label: "Everything in Free",
                    sub: t.reflection.nothingRemoved,
                    color: "text-qm-faint",
                  },
                ].map(({ label, sub, color }) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 text-sm text-qm-secondary"
                  >
                    <span className={`mt-0.5 shrink-0 text-sm ${color}`}>✓</span>
                    <div>
                      <p className="font-medium text-qm-primary">{label}</p>
                      <p className="text-xs text-qm-faint">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Free vs Premium comparison */}
              <div className="mt-8 max-w-sm overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03]">
                <div className="grid grid-cols-[1fr_auto_auto] border-b border-white/[0.06] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-faint">
                  <span />
                  <span className="w-16 text-center">Free</span>
                  <span className="w-16 text-center text-qm-positive">
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
                    <span className="text-qm-muted">{label}</span>
                    <span
                      className={`w-16 text-center text-xs ${
                        free === "—" ? "text-qm-faint" : "text-qm-muted"
                      }`}
                    >
                      {free}
                    </span>
                    <span
                      className={`w-16 text-center text-xs font-medium ${
                        premium === "✓" || premium === "Unlimited"
                          ? "text-qm-positive"
                          : "text-qm-muted"
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
                  <span className="font-display text-4xl font-bold text-qm-primary">
                    {PRICING.monthly}
                  </span>
                  <span className="text-sm text-qm-muted">/ month</span>
                  <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-0.5 text-[11px] font-medium text-qm-positive">
                    {PRICING.valueLabel}
                  </span>
                </div>
                <p className="mb-4 text-xs text-qm-faint">
                  {PRICING.trialFreeFor} · then {PRICING.monthlyCadence} · Cancel
                  anytime
                </p>

                <div className="flex flex-col gap-2 sm:max-w-sm">
                  <UpgradeButton className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-6 py-4 text-base font-semibold text-qm-primary shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm" />

                  {/* Trust badge — all copy derives from PRICING */}
                  <div className="rounded-xl border border-qm-positive-border bg-qm-positive-strong/[0.04] px-4 py-2.5 text-center">
                    <p className="text-xs font-medium text-qm-secondary">
                      {PRICING.trialLabel} — no charge today
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-qm-faint">
                      Try everything during your {PRICING.trialLabel}. Cancel
                      before then and you won&apos;t be charged.
                    </p>
                  </div>

                  <Link
                    href="/insights/preview"
                    className="inline-flex w-full items-center justify-center rounded-full border border-qm-border-subtle px-6 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
                  >
                    Preview Premium insights first →
                  </Link>
                </div>

                <p className="mt-3 text-xs text-qm-faint">
                  {PAYMENT.checkoutTrustLine}
                </p>
                <p className="mt-1 text-xs text-qm-faint">
                  By subscribing you agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-qm-positive underline underline-offset-2 transition-colors hover:text-qm-positive"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-qm-positive underline underline-offset-2 transition-colors hover:text-qm-positive"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Already free? */}
              <p className="mt-5 text-xs text-qm-faint">
                Already using Free?{" "}
                <span className="text-qm-faint">
                  Premium unlocks unlimited reflections, pattern insights,
                  weekly summaries, and the why-this-keeps-happening layer.
                </span>
              </p>
            </div>

            {/* Right — live proof card */}
            <div className="lg:sticky lg:top-6">
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-qm-positive-strong/[0.07] blur-[60px]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-qm-border-subtle px-6 py-4" style={{ backgroundColor: "#0f121f" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-qm-positive shadow-sm shadow-emerald-400/60" />
                    <p className="text-xs font-medium text-qm-faint">
                      Your hidden pattern
                    </p>
                  </div>
                  <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-qm-positive">
                    Premium insight
                  </span>
                </div>

                {/* Input side */}
                <div className="px-6 pb-5 pt-5" style={{ backgroundColor: "#141828" }}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
                    From your entries
                  </p>
                  <div className="space-y-2.5">
                    {[
                      {
                        label: "Emotional load",
                        pct: 64,
                        color: "bg-qm-positive",
                      },
                      {
                        label: "Responsibility for others",
                        pct: 50,
                        color: "bg-qm-positive-muted",
                      },
                      {
                        label: "Overwhelm / exhaustion",
                        pct: 45,
                        color: "bg-qm-premium-soft",
                      },
                      {
                        label: "Clarity (↑ rising)",
                        pct: 28,
                        color: "bg-qm-premium-soft",
                      },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-qm-faint">
                            {label}
                          </span>
                          <span className="text-xs text-qm-faint">
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-qm-card">
                          <div
                            className={`h-1.5 rounded-full ${color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 rounded-xl border border-qm-border-subtle bg-qm-card px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-qm-primary">
                        14
                        <span className="text-sm font-normal text-qm-faint">
                          /22
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-qm-faint">
                        entries with
                        <br />
                        emotional load
                      </p>
                    </div>
                    <div className="flex-1 rounded-xl border border-qm-border-subtle bg-qm-card px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-qm-primary">
                        3
                        <span className="text-sm font-normal text-qm-faint">
                          wks
                        </span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-qm-faint">
                        pattern has
                        <br />
                        been building
                      </p>
                    </div>
                  </div>
                </div>

                {/* Output side */}
                <div className="border-t border-qm-positive-border bg-qm-positive-bg px-6 pb-6 pt-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-qm-positive-soft" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
                      {CONFIG.appName} reflects
                    </span>
                    <div className="h-px flex-1 bg-qm-positive-soft" />
                  </div>
                  <p className="text-[14px] leading-[1.7] text-qm-primary">
                    You often sound most overwhelmed when you feel responsible
                    for{" "}
                    <span className="text-qm-positive">
                      keeping everything steady for everyone else
                    </span>{" "}
                    — and rarely give yourself the same patience.
                  </p>
                  <div className="mt-4 rounded-xl border border-qm-positive-border bg-qm-positive-strong/[0.04] p-3">
                    <p className="text-xs leading-relaxed text-qm-muted">
                      This pattern appeared in your last 3 weeks of entries. It
                      tends to peak on Sundays.
                    </p>
                  </div>
                  <p className="mt-4 text-[11px] text-qm-positive">
                    Only you can see this. Never shared, never used to train AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What Premium surfaces ─────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
              What Premium starts surfacing
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              The patterns are easier to trust{" "}
              <span className="text-qm-positive">
                when you can finally see them.
              </span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">
              Across your entries, {CONFIG.appName} finds what keeps surfacing —
              the emotions, themes, and questions that repeat without you
              noticing.
            </p>
            <p className="mt-2 text-xs text-qm-faint">
              The cards below are illustrative examples — yours will be built
              from your own entries.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 — What shows up most */}
            <div className="rounded-[1.5rem] border border-qm-premium-border bg-qm-premium-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-premium">
                What shows up most
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary">
                Emotional load appears in{" "}
                <span className="text-qm-premium">14 of your last 22</span>{" "}
                entries.
              </p>
              <div className="mt-4 space-y-2">
                {[
                  { label: "Emotional load", pct: 64, color: "bg-qm-premium" },
                  { label: "Overwhelm", pct: 45, color: "bg-qm-premium-soft" },
                  { label: "Clarity", pct: 28, color: "bg-qm-premium-soft" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-qm-faint">{label}</span>
                      <span className="text-xs text-qm-faint">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-qm-card">
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
            <div className="rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
                What keeps returning
              </p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary">
                Responsibility and communication are the{" "}
                <span className="text-qm-positive">
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
                      "border-qm-positive-border bg-qm-positive-soft text-qm-positive",
                  },
                  {
                    label: "Communication",
                    count: "9×",
                    color:
                      "border-qm-positive-border bg-qm-positive-soft text-qm-positive",
                  },
                  {
                    label: "Boundary-setting",
                    count: "7×",
                    color:
                      "border-qm-border-subtle bg-qm-card text-qm-muted",
                  },
                  {
                    label: "Exhaustion",
                    count: "6×",
                    color:
                      "border-qm-border-subtle bg-qm-card text-qm-muted",
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
            <div className="rounded-[1.5rem] border border-qm-warning-border bg-qm-warning-strong/[0.04] p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-warning">
                What may be driving it
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">
                You often sound most overwhelmed when you feel responsible for{" "}
                <span className="text-qm-warning">
                  keeping everything steady for everyone else
                </span>{" "}
                — and rarely give yourself the same patience.
              </p>
              <div className="mt-4 rounded-xl border border-qm-warning-border bg-qm-warning-strong/[0.04] p-3">
                <p className="text-xs leading-relaxed text-qm-muted">
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
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">
                Curiosity and honesty are{" "}
                <span className="text-sky-300">rising in recent entries</span> —
                which often signals that something important is becoming
                clearer.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-qm-faint">
                <span className="text-sky-400">↑</span>
                <span>Clarity signal up over the last 2 weeks</span>
              </div>
            </div>

            {/* Card 5 — Weekly mirror */}
            <div className="rounded-[1.5rem] border border-qm-danger-border bg-qm-danger-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-danger">
                Your weekly mirror
              </p>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">
                This week, your entries returned most often to questions of
                worth, pace, and{" "}
                <span className="text-qm-danger">
                  what you&apos;re actually allowed to need
                </span>
                .
              </p>
              <p className="mt-3 text-[11px] text-qm-faint">
                Generated every Monday · Personal to your entries only
              </p>
            </div>

            {/* Card 6 — A question worth sitting with */}
            <div className="rounded-[1.5rem] border border-qm-border-subtle bg-qm-muted/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-muted">
                A question worth sitting with
              </p>
              <p className="mt-3 text-lg font-medium leading-snug text-qm-primary">
                &ldquo;What keeps making you say you&apos;re fine before
                you&apos;ve had a chance to ask whether you are?&rdquo;
              </p>
              <p className="mt-3 text-xs text-qm-faint">
                Generated from your last 6 entries. Not a prompt to answer —
                just something to carry.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/insights/preview"
              className="inline-flex items-center gap-2 text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive"
            >
              See a full example of Premium insights →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mid-page CTA ─────────────────────────────────────────────────── */}
      <div className="border-b border-qm-border-subtle bg-qm-positive-strong/[0.03] py-10">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="mb-4 font-display text-xl font-medium text-qm-primary sm:text-2xl">
            The pattern you&apos;ve been sensing is already there.
            <br />
            <span className="text-qm-positive">
              Premium helps you finally name it.
            </span>
          </p>
          <div className="flex flex-col items-center gap-2">
            <UpgradeButton className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-3.5 text-sm font-semibold text-qm-primary shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60" />
            <p className="text-xs text-qm-faint">
              {PRICING.trialFreeFor} · then {PRICING.monthlyCadence} · Cancel
              anytime
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b bg-qm-card py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-xl font-semibold text-qm-primary sm:text-2xl">
            A few honest answers
          </h2>
          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-qm-border-subtle pb-5">
                <p className="text-[15px] font-medium text-qm-primary sm:text-base">
                  {q}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-qm-faint">
                  {a}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-qm-faint">
            <Link
              href="/terms"
              className="text-qm-positive-strong transition-colors hover:text-qm-positive"
            >
              Terms of Service →
            </Link>
            <Link
              href="/privacy"
              className="text-qm-positive-strong transition-colors hover:text-qm-positive"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-qm-border-subtle py-20 sm:py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-qm-positive-strong/[0.08] blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-2xl font-semibold text-qm-primary sm:text-4xl">
            Something is trying to become clear.
            <br />
            <span className="text-qm-positive">
              Let&apos;s help you hear it.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-qm-faint sm:text-base">
            Start with a single entry. When you want the deeper picture, Premium
            helps {CONFIG.appName} connect the dots.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <UpgradeButton
              className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-4 text-base font-semibold text-qm-primary shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm"
              label={`Start ${PRICING.trialLabel} →`}
            />
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-7 py-4 text-base font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary sm:py-3.5 sm:text-sm"
            >
              Start free first
            </Link>
          </div>
          <p className="mt-5 text-xs text-qm-faint">
            {PRICING.trialFreeFor} · No charge today · Cancel anytime · No ads,
            ever
          </p>
        </div>
      </section>
    </div>
  );
}
