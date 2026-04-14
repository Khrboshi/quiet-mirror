"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRICING } from "@/app/lib/pricing";
import { useTranslation } from "@/app/components/I18nProvider";
import { PAYMENT } from "@/app/lib/payment";
import { CONFIG } from "@/app/lib/config";
import { QM } from "@/app/lib/colors";

// ─── Upgrade button ─────────────────────────────────────────────────────────

function UpgradeButton({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const uf = t.upgradeFull;
  const ps = t.pricingStrings;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabel = ps.startTrialCta(ps.trialLabel(PRICING.trialDays));

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
      if (data?.checkoutUrl) {
        // Redirect to Dodo-hosted checkout page.
        // On success, Dodo redirects back to /upgrade/confirmed.
        window.location.href = data.checkoutUrl;
      } else {
        setError(`${t.errors.entryGenericFail} ${CONFIG.supportEmail}.`);
      }
    } catch {
      setError(`${t.errors.entryGenericFail} ${CONFIG.supportEmail}.`);
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
        {loading ? t.upgradePage.redirecting : (label ?? defaultLabel)}
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
  const up = t.upgradePage;
  const uf = t.upgradeFull;
  const ps = t.pricingStrings;
  const pf = t.premiumFeatures;

  const faqs = [
    { q: uf.faq1Q, a: uf.faq1A },
    { q: uf.faq2Q, a: uf.faq2A(PRICING.freeMonthlyCredits) },
    { q: uf.faq3Q, a: uf.faq3A(ps.trialLabel(PRICING.trialDays), ps.trialNoChargeUntil(PRICING.trialDays + 1), CONFIG.supportEmail) },
    { q: uf.faq4Q, a: uf.faq4A },
    { q: uf.faq5Q, a: uf.faq5A },
    { q: uf.faq6Q, a: uf.faq6A(CONFIG.appName) },
    { q: uf.faq7Q(ps.perMonth(PRICING.monthly)), a: uf.faq7A(CONFIG.appName, ps.perMonth(PRICING.monthly)) },
  ];

  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-qm-border-subtle">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-qm-positive-strong/[0.13] blur-[110px]" />
        <div className="pointer-events-none absolute right-[-80px] top-24 h-72 w-72 rounded-full bg-cyan-500/[0.08] blur-[90px]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,480px)] lg:items-start lg:gap-14">
            {/* Left — copy + CTA */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
                {CONFIG.appName}{uf.heroTag}
              </p>

              <h1 className="mt-4 font-display text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.2rem]">
                {uf.heroH1}
                <br />
                <span className="text-qm-positive">{uf.heroH1Accent}</span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-qm-secondary sm:text-[17px]">
                {uf.heroDesc(CONFIG.appName)}
              </p>

              {/* Feature list */}
              <ul className="mt-7 space-y-3">
                {[
                  { label: pf.f1Label, sub: pf.f1Sub,       color: "text-qm-positive" },
                  { label: pf.f2Label, sub: pf.f2Sub,       color: "text-qm-premium"  },
                  { label: pf.f3Label, sub: pf.f3Sub,       color: "text-qm-warning"  },
                  { label: pf.f4Label, sub: pf.f4Sub,       color: "text-qm-premium"  },
                  { label: pf.f5Label, sub: pf.f5Sub, color: "text-qm-faint" },
                ].map(({ label, sub, color }) => (
                  <li key={label} className="flex items-start gap-3 text-sm text-qm-secondary">
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
                  <span className="w-16 text-center">{t.dashboard.free}</span>
                  <span className="w-16 text-center text-qm-positive">Premium</span>
                </div>
                {[
                  { label: up.compRow1, free: "✓",  premium: "✓" },
                  { label: up.compRow2, free: `${PRICING.freeMonthlyCredits} ${ps.perMoShort}`, premium: up.compUnlimited },
                  { label: up.compRow3, free: "—",  premium: "✓" },
                  { label: up.compRow4, free: "—",  premium: "✓" },
                  { label: up.compRow5, free: "—",  premium: "✓" },
                  { label: up.compRow6, free: "✓",  premium: "✓" },
                ].map(({ label, free, premium }, i) => (
                  <div
                    key={label}
                    className={`grid grid-cols-[1fr_auto_auto] items-center px-4 py-2.5 text-sm ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}
                  >
                    <span className="text-qm-muted">{label}</span>
                    <span className={`w-16 text-center text-xs ${free === "—" ? "text-qm-faint" : "text-qm-muted"}`}>
                      {free}
                    </span>
                    <span className={`w-16 text-center text-xs font-medium ${premium === "✓" || premium === up.compUnlimited ? "text-qm-positive" : "text-qm-muted"}`}>
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
                  <span className="text-sm text-qm-muted">{uf.perMonth}</span>
                  <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-0.5 text-[11px] font-medium text-qm-positive">
                    {ps.valueLabel(PRICING.trialDays)}
                  </span>
                </div>
                <p className="mb-4 text-xs text-qm-faint">
                  {ps.trialFreeFor(PRICING.trialDays)} · {t.upgrade.cancelAnytime}
                </p>

                <div className="flex flex-col gap-2 sm:max-w-sm">
                  <UpgradeButton className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-6 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm" />

                  <div className="rounded-xl border border-qm-positive-border bg-qm-positive-strong/[0.04] px-4 py-2.5 text-center">
                    <p className="text-xs font-medium text-qm-secondary">
                      {ps.trialLabel(PRICING.trialDays)} — {uf.trialNoCharge}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-qm-faint">
                      {uf.trialExplainer(ps.trialLabel(PRICING.trialDays))}
                    </p>
                  </div>

                  <Link
                    href="/insights/preview"
                    className="inline-flex w-full items-center justify-center rounded-full border border-qm-border-subtle px-6 py-3 text-sm font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary"
                  >
                    {uf.previewInsights}
                  </Link>
                </div>

                <p className="mt-3 text-xs text-qm-faint">{PAYMENT.checkoutTrustLine}</p>
                <p className="mt-1 text-xs text-qm-faint">
                  {uf.bySubscribing}{" "}
                  <Link href="/terms" className="text-qm-positive underline underline-offset-2 transition-colors hover:text-qm-positive-hover">
                    {uf.termsOfService}
                  </Link>{" "}
                  {/* "and" connector — translated */}
                  {uf.andConnector}{" "}
                  <Link href="/privacy" className="text-qm-positive underline underline-offset-2 transition-colors hover:text-qm-positive-hover">
                    {uf.privacyPolicy}
                  </Link>
                  .
                </p>
              </div>

              <p className="mt-5 text-xs text-qm-faint">
                {uf.alreadyFree}{" "}
                <span className="text-qm-faint">{uf.alreadyFreeDesc}</span>
              </p>
            </div>

            {/* Right — live proof card */}
            <div className="lg:sticky lg:top-6">
              <div className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-qm-positive-strong/[0.07] blur-[60px]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.09] shadow-2xl shadow-black/60">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-qm-border-subtle px-6 py-4" style={{ backgroundColor: QM.bgElevated }}>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-qm-positive shadow-sm" />
                    <p className="text-xs font-medium text-qm-faint">{uf.proofCardHeader}</p>
                  </div>
                  <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-qm-positive">
                    {uf.proofCardBadge}
                  </span>
                </div>

                {/* Input side */}
                <div className="px-6 pb-5 pt-5" style={{ backgroundColor: QM.bgSoft }}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
                    {uf.proofFromEntries}
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label: uf.proofBar1, pct: 64, color: "bg-qm-positive" },
                      { label: uf.proofBar2, pct: 50, color: "bg-qm-positive-muted" },
                      { label: uf.proofBar3, pct: 45, color: "bg-qm-premium-muted" },
                      { label: uf.proofBar4, pct: 28, color: "bg-qm-premium-muted" },
                    ].map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs text-qm-faint">{label}</span>
                          <span className="text-xs text-qm-faint">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-qm-card">
                          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <div className="flex-1 rounded-xl border border-qm-border-subtle bg-qm-card px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-qm-primary">
                        14<span className="text-sm font-normal text-qm-faint">/22</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-qm-faint" style={{ whiteSpace: "pre-line" }}>
                        {uf.proofStat1}
                      </p>
                    </div>
                    <div className="flex-1 rounded-xl border border-qm-border-subtle bg-qm-card px-3 py-2.5 text-center">
                      <p className="font-display text-xl font-bold text-qm-primary">
                        3<span className="text-sm font-normal text-qm-faint"> wks</span>
                      </p>
                      <p className="mt-0.5 text-[10px] text-qm-faint" style={{ whiteSpace: "pre-line" }}>
                        {uf.proofStat2}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Output side */}
                <div className="border-t border-qm-positive-border bg-qm-positive-bg px-6 pb-6 pt-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-qm-positive-soft" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
                      {CONFIG.appName} {uf.proofReflects}
                    </span>
                    <div className="h-px flex-1 bg-qm-positive-soft" />
                  </div>
                  <p className="text-[14px] leading-[1.7] text-qm-primary">{uf.proofQuote}</p>
                  <div className="mt-4 rounded-xl border border-qm-positive-border bg-qm-positive-strong/[0.04] p-3">
                    <p className="text-xs leading-relaxed text-qm-muted">{uf.proofNote}</p>
                  </div>
                  <p className="mt-4 text-[11px] text-qm-positive">{uf.proofPrivacy}</p>
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
              {uf.surfacesTag}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              {uf.surfacesH2}{" "}
              <span className="text-qm-positive">{uf.surfacesH2Accent}</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">{uf.surfacesDesc(CONFIG.appName)}</p>
            <p className="mt-2 text-xs text-qm-faint">{uf.surfacesNote}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-[1.5rem] border border-qm-premium-border bg-qm-premium-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-premium">{uf.card1Tag}</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary">{uf.card1Headline}</p>
              <div className="mt-4 space-y-2">
                {[
                  { label: uf.proofBar1, pct: 64, color: "bg-qm-premium" },
                  { label: t.homeBelowFold.cardABar2, pct: 45, color: "bg-qm-premium-muted" },
                  { label: t.homeBelowFold.cardABar3, pct: 28, color: "bg-qm-premium-muted" },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-qm-faint">{label}</span>
                      <span className="text-xs text-qm-faint">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-qm-card">
                      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">{uf.card2Tag}</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary">{uf.card2Headline}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: uf.cardLabel1, count: "11×", color: "border-qm-positive-border bg-qm-positive-soft text-qm-positive" },
                  { label: uf.cardLabel2, count: "9×",  color: "border-qm-positive-border bg-qm-positive-soft text-qm-positive" },
                  { label: uf.cardLabel3, count: "7×",  color: "border-qm-border-subtle bg-qm-card text-qm-muted" },
                  { label: uf.cardLabel4, count: "6×",  color: "border-qm-border-subtle bg-qm-card text-qm-muted" },
                ].map(({ label, count, color }) => (
                  <div key={label} className={`rounded-xl border px-3 py-2 ${color}`}>
                    <p className="text-[11px] font-medium">{label}</p>
                    <p className="mt-0.5 text-xs opacity-70">{count} {uf.card2PerMonth}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-[1.5rem] border border-qm-warning-border bg-qm-warning-strong/[0.04] p-6 sm:col-span-2 lg:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-warning">{uf.card3Tag}</p>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">{uf.card3Quote}</p>
              <div className="mt-4 rounded-xl border border-qm-warning-border bg-qm-warning-strong/[0.04] p-3">
                <p className="text-xs leading-relaxed text-qm-muted">{uf.card3Note}</p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="rounded-[1.5rem] border border-sky-500/20 bg-sky-500/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-400">{uf.card4Tag}</p>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">
                {uf.card4Text}{" "}
                <span className="text-sky-300">{uf.card4TextAccent}</span>
                {uf.card4TextPost}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-qm-faint">
                <span className="text-sky-400">↑</span>
                <span>{uf.card4Note}</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="rounded-[1.5rem] border border-qm-danger-border bg-qm-danger-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-danger">{uf.card5Tag}</p>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">{uf.card5Text}</p>
              <p className="mt-3 text-[11px] text-qm-faint">{uf.card5Note}</p>
            </div>

            {/* Card 6 */}
            <div className="rounded-[1.5rem] border border-qm-border-subtle bg-qm-muted/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-muted">{uf.card6Tag}</p>
              <p className="mt-3 text-lg font-medium leading-snug text-qm-primary">{uf.card6Quote}</p>
              <p className="mt-3 text-xs text-qm-faint">{uf.card6Note}</p>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/insights/preview" className="inline-flex items-center gap-2 text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover">
              {uf.seeFullExample}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mid-page CTA ─────────────────────────────────────────────────── */}
      <div className="border-b border-qm-border-subtle bg-qm-positive-strong/[0.03] py-10">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <p className="mb-4 font-display text-xl font-medium text-qm-primary sm:text-2xl">
            {uf.midH}
            <br />
            <span className="text-qm-positive">{uf.midAccent}</span>
          </p>
          <div className="flex flex-col items-center gap-2">
            <UpgradeButton className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60" />
            <p className="text-xs text-qm-faint">
              {ps.trialFreeFor(PRICING.trialDays)} · {t.upgrade.cancelAnytime}
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b bg-qm-card py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="font-display text-xl font-semibold text-qm-primary sm:text-2xl">
            {uf.faqHeading}
          </h2>
          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {faqs.map(({ q, a }) => (
              <div key={q} className="border-b border-qm-border-subtle pb-5">
                <p className="text-[15px] font-medium text-qm-primary sm:text-base">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-qm-faint">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-qm-faint">
            <Link href="/terms" className="text-qm-positive-strong transition-colors hover:text-qm-positive-hover">
              {uf.faqTerms}
            </Link>
            <Link href="/privacy" className="text-qm-positive-strong transition-colors hover:text-qm-positive-hover">
              {uf.faqPrivacy}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-qm-border-subtle py-20 sm:py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-qm-positive-strong/[0.08] blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <h2 className="font-display text-2xl font-semibold text-qm-primary sm:text-4xl">
            {uf.closingH}
            <br />
            <span className="text-qm-positive">{uf.closingAccent}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-qm-faint sm:text-base">
            {uf.closingDesc(CONFIG.appName)}
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <UpgradeButton
              className="inline-flex items-center justify-center rounded-full bg-qm-accent px-7 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px disabled:opacity-60 sm:py-3.5 sm:text-sm"
              label={ps.startTrialCta(ps.trialLabel(PRICING.trialDays))}
            />
            <Link
              href="/magic-login"
              className="inline-flex items-center justify-center rounded-full border border-qm-border-subtle px-7 py-4 text-base font-medium text-qm-muted transition-colors hover:border-qm-border-subtle hover:text-qm-primary sm:py-3.5 sm:text-sm"
            >
              {uf.closingStartFree}
            </Link>
          </div>
          <p className="mt-5 text-xs text-qm-faint">{uf.closingTrust}</p>
        </div>
      </section>
    </div>
  );
}
