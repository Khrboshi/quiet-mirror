"use client";
import Link from "next/link";
import ScrollReveal from "@/app/components/ScrollReveal";
import { PRICING } from "@/app/lib/pricing";
import { useTranslation } from "@/app/components/I18nProvider";
import { PAYMENT } from "@/app/lib/payment";

export default function HomeBelowFold() {
  const { t } = useTranslation();
  const ps = t.pricingStrings;
  const h = t.homeBelowFold;

  return (
    <>
      {/* ── 0. PROOF ─────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-positive-border bg-qm-positive-strong/[0.03] py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal className="mb-8 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.proofTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              {h.proofH1}<br className="hidden sm:block" />
              <span className="text-qm-positive"> {h.proofH2}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal>
            <div className="overflow-hidden rounded-[1.75rem] border border-qm-positive-border shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between border-b border-qm-positive-border bg-qm-positive-strong/[0.08] px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-qm-positive shadow-sm" />
                  <p className="text-sm font-medium text-qm-positive">{h.proofCardTitle}</p>
                </div>
                <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-qm-positive">{h.proofBadge}</span>
              </div>
              <div className="bg-qm-elevated px-6 py-7 sm:px-8 sm:py-8">
                <p className="font-display text-xl font-medium leading-relaxed text-qm-primary sm:text-2xl">{h.proofQuote}</p>
                <div className="mt-7 grid gap-5 sm:grid-cols-[1fr_auto]">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-faint">{h.proofBarsLabel}</p>
                    <div className="space-y-2.5">
                      {[
                        { label: h.proofBar1, pct: 64, color: "bg-qm-positive" },
                        { label: h.proofBar2, pct: 50, color: "bg-qm-positive-muted" },
                        { label: h.proofBar3, pct: 45, color: "bg-qm-premium-muted" },
                        { label: h.proofBar4, pct: 28, color: "bg-qm-premium-muted" },
                      ].filter(b => b.label).map(({ label, pct, color }) => (
                        <div key={label}>
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs text-qm-muted">{label}</span>
                            <span className="text-xs text-qm-faint">{pct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-qm-soft">
                            <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 sm:flex-col sm:justify-center">
                    <div className="rounded-2xl border border-qm-border-card bg-qm-soft px-4 py-3 text-center sm:px-5">
                      <p className="font-display text-2xl font-bold text-qm-primary sm:text-3xl">14<span className="text-base font-normal text-qm-faint">/22</span></p>
                      <p className="mt-1 text-[11px] leading-snug text-qm-faint">{h.proofStat1}</p>
                    </div>
                    <div className="rounded-2xl border border-qm-border-card bg-qm-soft px-4 py-3 text-center sm:px-5">
                      <p className="font-display text-2xl font-bold text-qm-primary sm:text-3xl">3<span className="text-base font-normal text-qm-faint">wks</span></p>
                      <p className="mt-1 text-[11px] leading-snug text-qm-faint">{h.proofStat2}</p>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-[11px] text-qm-faint">{h.proofNote}</p>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <p className="mt-6 text-center text-sm text-qm-faint">
              {h.proofUnlock}{" "}
              <Link href="/insights/preview" className="text-qm-positive transition-colors hover:text-qm-positive-hover">{h.proofSeeEx}</Link>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 1. Recognition ───────────────────────────────────────────────── */}
      <section className="border-y border-qm-border-subtle py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal><p className="mb-6 text-[11px] font-medium uppercase tracking-[0.2em] text-qm-faint">{h.recTag}</p></ScrollReveal>
          <ScrollReveal stagger className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { quote: h.rec1, accent: "border-qm-premium-border bg-qm-premium-strong/[0.04]", dot: "bg-qm-premium" },
              { quote: h.rec2, accent: "border-qm-positive-border bg-qm-positive-strong/[0.04]", dot: "bg-qm-positive" },
              { quote: h.rec3, accent: "border-qm-warning-border bg-qm-warning-strong/[0.04]", dot: "bg-qm-warning" },
            ].map(({ quote, accent, dot }) => (
              <div key={quote} className={`rounded-2xl border p-5 ${accent}`}>
                <span className={`mb-3 block h-1.5 w-1.5 rounded-full ${dot}`} />
                <p className="text-sm italic leading-relaxed text-qm-secondary">&ldquo;{quote}&rdquo;</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── 2. AI Demo ────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle section-tinted py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-10 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive-muted">{h.demoTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              {h.demoH1} <span className="text-qm-positive">{h.demoH2}</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-qm-muted">{h.demoDesc}</p>
          </ScrollReveal>
          <ScrollReveal className="overflow-hidden rounded-[1.5rem] border border-qm-border-card md:grid md:grid-cols-2">
            <div className="border-b border-qm-border-subtle bg-qm-elevated p-6 md:border-b-0 md:border-e">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-faint">{h.demoInput}</p>
                <span className="rounded-full border border-qm-border-card px-2 py-0.5 text-[10px] text-qm-faint">{h.demoTime}</span>
              </div>
              <p className="text-[15px] leading-[1.75] text-qm-primary">{h.demoEntry}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {[h.demoBadge1, h.demoBadge2, h.demoBadge3].map((b) => (
                  <span key={b} className="rounded-full border border-qm-border-card px-2.5 py-0.5 text-[11px] text-qm-faint">{b}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-qm-positive-border bg-qm-positive-bg p-6 md:border-t-0">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">{h.demoOutput}</p>
                <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2 py-0.5 text-[10px] font-medium text-qm-positive">{h.demoImmediate}</span>
              </div>
              <p className="text-[15px] leading-[1.75] text-qm-primary">{h.demoReflection}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: h.demoTag1, color: "border-qm-positive-border bg-qm-positive-soft text-qm-positive" },
                  { label: h.demoTag2, color: "border-qm-premium-border bg-qm-premium-soft text-qm-premium" },
                  { label: h.demoTag3, color: "border-qm-warning-border bg-qm-warning-soft text-qm-warning" },
                ].map(({ label, color }) => (
                  <span key={label} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${color}`}>{label}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal stagger className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { step:"1", label:h.step1Label, sub:h.step1Sub, accent:"text-qm-positive", border:"border-qm-positive-border" },
              { step:"2", label:h.step2Label, sub:h.step2Sub, accent:"text-qm-premium", border:"border-qm-premium-border" },
              { step:"3", label:h.step3Label, sub:h.step3Sub, accent:"text-qm-warning", border:"border-qm-warning-border" },
            ].map(({ step, label, sub, accent, border }) => (
              <div key={step} className={`rounded-2xl border bg-qm-elevated p-5 ${border}`}>
                <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>{h.step} {step}</p>
                <p className="text-[15px] font-medium leading-snug text-qm-primary">{label}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-qm-faint">{sub}</p>
              </div>
            ))}
          </ScrollReveal>
          <div className="mt-8 text-center">
            <Link href="/magic-login" className="inline-flex items-center justify-center rounded-full bg-qm-accent px-6 py-3.5 text-sm font-semibold text-white shadow transition-all hover:bg-qm-accent-hover hover:-translate-y-px">{h.demoCta}</Link>
          </div>
        </div>
      </section>

      {/* ── 3. Insight Cards ────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle section-purple-tint py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.insightsTag}</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
                  {h.insightsH1} <br className="hidden sm:block" /><span className="text-qm-positive">{h.insightsH2}</span>
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-qm-muted">{h.insightsDesc}</p>
              </div>
              <div className="shrink-0"><span className="inline-flex items-center gap-1.5 rounded-full border border-qm-positive-border bg-qm-positive-soft px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-qm-positive">{h.insightsBadge}</span></div>
            </div>
          </ScrollReveal>
          <ScrollReveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card A */}
            <div className="rounded-[1.5rem] border border-qm-premium-border bg-qm-premium-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-premium">{h.cardATitle}</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary sm:text-xl">{h.cardAHead}</p>
              <div className="mt-4 space-y-2">
                {[{l:h.cardABar1,p:64},{l:h.cardABar2,p:45},{l:h.cardABar3,p:28}].filter(x=>x.l).map(({l,p})=>(
                  <div key={l}>
                    <div className="mb-1 flex items-center justify-between"><span className="text-xs text-qm-faint">{l}</span><span className="text-xs text-qm-faint">{p}%</span></div>
                    <div className="h-1.5 w-full rounded-full bg-qm-soft"><div className="h-1.5 rounded-full bg-qm-premium" style={{width:`${p}%`}}/></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Card B */}
            <div className="rounded-[1.5rem] border border-qm-positive-border bg-qm-positive-strong/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-positive">{h.cardBTitle}</p>
              <p className="mt-3 text-lg font-semibold leading-snug text-qm-primary sm:text-xl">{h.cardBHead}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[{l:h.cardBT1,c:"11×"},{l:h.cardBT2,c:"9×"},{l:h.cardBT3,c:"7×"},{l:h.cardBT4,c:"6×"}].map(({l,c})=>(
                  <div key={l} className="rounded-xl border border-qm-positive-border bg-qm-positive-soft px-3 py-2 text-qm-positive">
                    <p className="text-[11px] font-medium">{l}</p>
                    <p className="mt-0.5 text-xs opacity-70">{c} {h.cardBPer}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Card C */}
            <div className="relative rounded-[1.5rem] border border-qm-warning-border bg-qm-warning-strong/[0.04] p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-warning">{h.cardCTitle}</p>
                <span className="shrink-0 rounded-full border border-qm-warning-border bg-qm-warning-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-qm-warning">Premium</span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">{h.cardCHead}</p>
              <div className="mt-4 rounded-xl border border-qm-warning-border bg-qm-warning-strong/[0.04] p-3"><p className="text-xs leading-relaxed text-qm-muted">{h.cardCNote}</p></div>
            </div>
            {/* Card D */}
            <div className="relative rounded-[1.5rem] border border-qm-premium-border bg-qm-premium-strong/[0.04] p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-premium">{h.cardDTitle}</p>
                <span className="shrink-0 rounded-full border border-qm-premium-border bg-qm-premium-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-qm-premium">Premium</span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">{h.cardDHead}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-qm-faint"><span className="text-qm-premium">↑</span><span>{h.cardDNote}</span></div>
            </div>
            {/* Card E */}
            <div className="relative rounded-[1.5rem] border border-qm-danger-border bg-qm-danger-strong/[0.04] p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-danger">{h.cardETitle}</p>
                <span className="shrink-0 rounded-full border border-qm-danger-border bg-qm-danger-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-qm-danger">Premium</span>
              </div>
              <p className="mt-3 text-[15px] leading-[1.7] text-qm-primary">{h.cardEHead}</p>
              <p className="mt-3 text-[11px] text-qm-faint">{h.cardENote}</p>
            </div>
            {/* Card F */}
            <div className="rounded-[1.5rem] border border-qm-border-subtle bg-qm-muted/[0.04] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-muted">{h.cardFTitle}</p>
              <p className="mt-3 text-lg font-medium leading-snug text-qm-primary sm:text-xl">{h.cardFHead}</p>
              <p className="mt-3 text-xs text-qm-faint">{h.cardFNote}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal className="mt-8 text-center">
            <Link href="/insights/preview" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover">{h.insightsSeeMore}</Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 4. Different ─────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.diffTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              {h.diffH1} <span className="text-qm-positive">{h.diffH2}</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal stagger className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">{h.isTag}</p>
              <ul className="space-y-3">{[h.is1,h.is2,h.is3,h.is4].map(item=>(
                <li key={item} className="flex items-start gap-3 text-sm text-qm-secondary"><span className="mt-0.5 shrink-0 text-qm-positive">✓</span>{item}</li>
              ))}</ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-warning">{h.isNotTag}</p>
              <ul className="space-y-3">{[h.isNot1,h.isNot2,h.isNot3,h.isNot4].map(item=>(
                <li key={item} className="flex items-start gap-3 text-sm text-qm-secondary"><span className="mt-0.5 shrink-0 text-qm-warning">—</span>{item}</li>
              ))}</ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 5. Examples ──────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5">
          <ScrollReveal className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.exTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">
              {h.exH1} <span className="text-qm-positive">{h.exH2}</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">{h.exDesc}</p>
          </ScrollReveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
            {[
              {w:h.ex1W,r:h.ex1R,tags:[h.ex1T1,h.ex1T2,h.ex1T3]},
              {w:h.ex2W,r:h.ex2R,tags:[h.ex2T1,h.ex2T2,h.ex2T3]},
              {w:h.ex3W,r:h.ex3R,tags:[h.ex3T1,h.ex3T2,h.ex3T3]},
            ].map(({w,r,tags})=>(
              <ScrollReveal key={tags[0]} className="flex flex-col overflow-hidden rounded-[1.5rem] border border-qm-border-card">
                <div className="min-h-[160px] border-b border-qm-border-card bg-qm-elevated px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-muted">{h.exWroteLabel}</p>
                  <p className="mt-2 text-sm italic leading-relaxed text-qm-secondary">&ldquo;{w}&rdquo;</p>
                </div>
                <div className="flex-1 bg-qm-accent-soft px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-accent">{h.exReflectedLabel}</p>
                  <p className="mt-2 text-sm leading-relaxed text-qm-primary">{r}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map(e=><span key={e} className="rounded-full border border-qm-border-card bg-qm-elevated px-2.5 py-0.5 text-[11px] text-qm-muted">{e}</span>)}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal className="mt-8 text-center">
            <Link href="/magic-login" className="inline-flex items-center justify-center rounded-full bg-qm-accent px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px">{h.exCta}</Link>
            <p className="mt-3 text-xs text-qm-faint">{h.exNote}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. Trust ─────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-5">
          <ScrollReveal className="text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.trustTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">{h.trustH}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-qm-muted">{h.trustDesc}</p>
          </ScrollReveal>
          <ScrollReveal stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon:"🔒", title:h.trust1Title, body:h.trust1Body, border:"border-qm-positive-border", bg:"bg-qm-positive-strong/[0.03]" },
              { icon:"🛡️", title:ps.trialLabel(PRICING.trialDays), body:`${ps.trialFreeFor(PRICING.trialDays)} — ${ps.fullAccess}. ${ps.trialNoChargeUntil(PRICING.trialDays + 1).charAt(0).toUpperCase()+ps.trialNoChargeUntil(PRICING.trialDays + 1).slice(1)}.`, border:"border-qm-premium-border", bg:"bg-qm-premium-strong/[0.03]" },
              { icon:"✦", title:h.trust3Title, body:h.trust3Body, border:"border-qm-premium-border", bg:"bg-qm-premium-strong/[0.03]" },
            ].map(({ icon, title, body, border, bg })=>(
              <div key={title} className={`rounded-2xl border p-5 ${border} ${bg}`}>
                <p className="text-2xl">{icon}</p>
                <p className="mt-3 text-sm font-semibold text-qm-primary">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-qm-muted">{body}</p>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── Pattern interrupt ─────────────────────────────────────────────── */}
      <div className="border-y border-qm-border-subtle py-12 sm:py-14">
        <ScrollReveal className="mx-auto max-w-4xl px-5 text-center">
          <p className="font-display text-2xl font-medium leading-relaxed text-qm-primary sm:text-3xl sm:leading-relaxed">
            {h.patternQ1} <span className="text-qm-faint">{h.patternQ2}</span>
          </p>
        </ScrollReveal>
      </div>

      {/* ── 7. Pricing ────────────────────────────────────────────────────── */}
      <section className="border-b border-qm-border-subtle section-tinted py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-5">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.pricingTag}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-qm-primary sm:text-3xl">{h.pricingH}</h2>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">{h.pricingDesc}</p>
          </ScrollReveal>
          <ScrollReveal stagger className="flex flex-col-reverse gap-4 md:grid md:grid-cols-2 md:gap-5">
            <div className="flex flex-col rounded-2xl border border-qm-border-card bg-qm-elevated p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-qm-faint">{h.freeLabel}</p>
              <p className="mt-1 font-display text-xl font-semibold text-qm-primary sm:text-2xl">{h.freeTagline}</p>
              <div className="mt-2 flex items-baseline gap-1.5"><span className="text-3xl font-bold text-qm-primary">$0</span><span className="text-sm text-qm-muted">/ month</span></div>
              <p className="mt-3 text-sm text-qm-faint">{h.freeDesc}</p>
              <ul className="mt-5 space-y-3 text-sm text-qm-secondary">
                {[
                  { label: t.settingsPage.freeItem1, sub: t.settingsPage.freeItem2 },
                  { label: t.settingsPage.freeItem3(PRICING.freeMonthlyCredits), sub: h.freeF2Sub },
                  { label: h.freeF3Label, sub: h.freeF3Sub },
                  { label: h.freeF4Label, sub: h.freeF4Sub },
                ].map(({ label, sub })=>(
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-qm-positive-strong">✓</span>
                    <div><p>{label}</p><p className="text-xs text-qm-faint">{sub}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Link href="/magic-login" className="inline-flex w-full items-center justify-center rounded-full border border-qm-border-card bg-qm-elevated px-5 py-3 text-sm font-medium text-qm-secondary transition-colors hover:bg-qm-soft">{h.freeCta}</Link>
                <p className="mt-2 text-center text-xs text-qm-faint">{h.freeNote}</p>
              </div>
            </div>
            <div className="relative flex flex-col rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.04] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-qm-positive">{h.premiumLabel}</p>
              <p className="mt-1 font-display text-xl font-semibold text-qm-primary sm:text-2xl">{h.premiumTagline}</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-3xl font-bold text-qm-primary">{PRICING.monthly}</span>
                <span className="text-sm text-qm-muted">/ month</span>
                <span className="rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-0.5 text-[11px] font-medium text-qm-positive">{ps.valueLabel(PRICING.trialDays)}</span>
              </div>
              <p className="mt-1 text-xs text-qm-faint">{h.premiumCancelNote}</p>
              <p className="mt-3 text-sm text-qm-secondary">{h.premiumDesc}</p>
              <div className="mt-4 rounded-xl border border-qm-border-card bg-qm-elevated p-3 text-xs text-qm-muted">
                <p><span className="text-qm-faint">{h.premiumWithout}</span></p>
                <p className="mt-1"><span className="text-qm-positive">{h.premiumWith}</span></p>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-qm-primary">
                {[
                  {label:h.pF1Label,sub:h.pF1Sub},{label:h.pF2Label,sub:h.pF2Sub},
                  {label:h.pF3Label,sub:h.pF3Sub},{label:h.pF4Label,sub:h.pF4Sub},
                  {label:h.pF5Label,sub:h.pF5Sub},
                ].map(({label,sub})=>(
                  <li key={label} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-qm-positive">✓</span>
                    <div><p>{label}</p><p className="text-xs text-qm-faint">{sub}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-6">
                <Link href="/upgrade" className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-qm-accent-hover hover:-translate-y-px">{h.premiumCta}</Link>
                <div className="rounded-xl border border-qm-positive-border bg-qm-positive-strong/[0.04] px-4 py-2.5 text-center">
                  <p className="text-xs font-medium text-qm-secondary">🛡️ {ps.trialLabel(PRICING.trialDays)} — {ps.noChargeToday}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-qm-faint">{ps.trialFreeFor(PRICING.trialDays)} · {ps.thenPerMonth(ps.perMonth(PRICING.monthly))} · {h.premiumCancelNote}</p>
                </div>
                <Link href="/insights/preview" className="inline-flex w-full items-center justify-center rounded-full border border-qm-border-card px-5 py-2.5 text-xs font-medium text-qm-secondary transition-colors hover:bg-qm-soft">{h.premiumPreview}</Link>
              </div>
              <p className="mt-3 text-center text-xs text-qm-faint">{PAYMENT.checkoutTrustLine}</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 8. FAQ ────────────────────────────────────────────────────────── */}
      <section className="bg-qm-bg py-12 sm:py-14">
        <div className="mx-auto max-w-3xl px-5">
          <ScrollReveal><h2 className="font-display text-xl font-semibold text-qm-primary sm:text-2xl">{h.faqH}</h2></ScrollReveal>
          <div className="mt-6 space-y-5 sm:mt-7 sm:space-y-6">
            {[
              {q:h.faq1Q,a:h.faq1A},{q:h.faq2Q,a:h.faq2A},{q:h.faq3Q,a:h.faq3A},
              {q:h.faq4Q,a:h.faq4A},{q:h.faq5Q,a:h.faq5A(PRICING.freeMonthlyCredits)},
            ].map(({q,a})=>(
              <ScrollReveal key={q}>
                <div className="border-b border-qm-border-subtle pb-5">
                  <p className="text-[15px] font-medium text-qm-primary sm:text-base">{q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-qm-faint">{a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-8 text-xs text-qm-faint">
            <Link href="/privacy" className="text-qm-positive-strong transition-colors hover:text-qm-positive-hover">{h.privacyLink}</Link>
          </div>
        </div>
      </section>

      {/* ── 9. Closing CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-qm-border-subtle section-cta-gradient py-20 sm:py-28">
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[rgba(16,185,129,0.08)] blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <ScrollReveal>
            <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-qm-positive">{h.ctaTag}</p>
            <h2 className="font-display text-3xl font-semibold leading-[1.08] text-qm-primary sm:text-4xl">
              {h.ctaH1}<br /><span className="text-qm-positive">{h.ctaH2}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-qm-muted">{h.ctaDesc}</p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link href="/magic-login" className="inline-flex items-center justify-center rounded-full bg-qm-accent px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:bg-qm-accent-hover hover:-translate-y-0.5">{h.ctaBtn}</Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-qm-faint">
              <span>✓ {h.ctaT1}</span><span>✓ {h.ctaT2}</span>
              <span>✓ {ps.trialLabel(PRICING.trialDays)}</span><span>✓ {h.ctaT4}</span>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
