/**
 * app/(protected)/journal/[id]/JournalEntryClient.tsx
 *
 * Client component for the individual journal entry view.
 *
 * Responsibilities:
 * - Renders the entry content and its AI reflection (themes, emotions,
 *   corepattern, questions, next step) with domain-aware colour coding
 * - Handles the "Get Reflection" flow: calls POST /api/ai/reflection,
 *   shows upgrade modal for free users who hit their credit limit
 * - Supports entry deletion with confirmation
 * - Crisis content detection result passed through from the server
 */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useUserPlan } from "@/app/components/useUserPlan";
import UpgradeTriggerModal from "@/app/components/UpgradeTriggerModal";
import { PRICING } from "@/app/lib/pricing";
import { useTranslation } from "@/app/components/I18nProvider";
import { track } from "@/app/components/telemetry";

type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
};

type Reflection = {
  summary: string;
  corepattern?: string;
  themes: string[];
  emotions: string[];
  gentlenextstep: string;
  questions: string[];
  domain?: string;
  crisis?: boolean;
  message?: string;
  resources?: { label: string; value: string }[];
};

function parseSummary(summary: string): { carrying: string; happening: string; deeper: string } {
  const rawCarrying = summary.match(/What you're carrying:\s*([^\n]+(?:\n(?!What's|Deeper)[^\n]+)*)/i)?.[1]?.trim() ?? "";
  const carrying = rawCarrying
    .replace(/\s*What's really happening:.*$/is, "")
    .replace(/\s*Deeper direction:.*$/is, "")
    .trim();
  const rawHappening = summary.match(/What's really happening:\s*([^\n]+(?:\n(?!Deeper)[^\n]+)*)/i)?.[1]?.trim() ?? "";
  const happening = rawHappening.replace(/\s*Deeper direction:.*$/is, "").trim();
  const deeper = summary.match(/Deeper direction:\s*([^\n]+(?:\n[^\n]+)*)/i)?.[1]?.trim() ?? "";
  return { carrying, happening, deeper };
}

function parseNextStep(step: string): { optionA: string; optionB: string; script: string } {
  if (!step) return { optionA: "", optionB: "", script: "" };
  const optionA = step.match(/Option A:\s*(.+?)(?=Option B:|Script line:|$)/is)?.[1]?.trim() ?? "";
  const optionB = step.match(/Option B:\s*(.+?)(?=Script line:|$)/is)?.[1]?.trim() ?? "";
  const scriptRaw = step.match(/Script line:\s*[""'\u201c\u2018]?(.+?)[""'\u201d\u2019]?\s*$/is)?.[1]?.trim() ?? "";
  const script = scriptRaw.replace(/^["\u201c\u2018]|["\u201d\u2019]$/g, "").trim();
  return { optionA, optionB, script };
}


// Emotion → --qm-dv-* token mapping.
// Each emotion is assigned to its closest semantic data-viz token so the
// legacy-remap layer in globals.css cannot override these colours — they
// are intentionally distinct (grief ≠ hope ≠ anxiety) and must stay that way.
// CSS variables are fixed across light/dark mode by design.
const EMOTION_TOKEN: Record<string, string> = {
  anxiety:     "var(--qm-dv-health)",   // health/stress family
  anxious:     "var(--qm-dv-health)",
  fear:        "var(--qm-dv-fear)",     // fear/anger family
  scared:      "var(--qm-dv-fear)",
  hurt:        "var(--qm-dv-fear)",
  frustration: "var(--qm-dv-fear)",
  anger:       "var(--qm-dv-fear)",
  grief:       "var(--qm-dv-grief)",    // grief/confusion/doubt family
  confusion:   "var(--qm-dv-grief)",
  uncertainty: "var(--qm-dv-grief)",
  sadness:     "var(--qm-dv-grief)",
  longing:     "var(--qm-dv-grief)",
  overwhelm:   "var(--qm-dv-grief)",
  guilt:       "var(--qm-dv-creative)", // creative/shame/guilt family
  shame:       "var(--qm-dv-creative)",
  hope:        "var(--qm-dv-positive)", // calm/hope/gratitude/joy family
  pride:       "var(--qm-dv-positive)",
  love:        "var(--qm-dv-love)",     // love/relationship/connection family
  tiredness:   "var(--qm-dv-fitness)",  // fitness/energy family
  exhaustion:  "var(--qm-dv-fitness)",
};

// Returns inline style props for an emotion pill — bg, text, and border all
// derived from the same --qm-dv-* token at different opacities.
// Template-literal color-mix() works with any valid CSS color or var(),
// avoiding brittle string-replace on the token's internal format.
function emotionStyle(e: string): CSSProperties {
  const token = EMOTION_TOKEN[e.toLowerCase()];
  // Fallback: unknown emotions use the existing border-card / text-muted / accent-soft
  // tokens so the default state stays aligned with the design system.
  if (!token) return {
    backgroundColor: "var(--qm-accent-soft)",
    color:           "var(--qm-text-muted)",
    borderColor:     "var(--qm-border-card)",
  };
  // alpha channels match the previous Tailwind /15 bg, full text, /25 border pattern
  return {
    backgroundColor: `color-mix(in srgb, ${token} 15%, transparent)`,
    color:           token,
    borderColor:     `color-mix(in srgb, ${token} 25%, transparent)`,
  };
}

export default function JournalEntryClient({
  entry,
  initialReflection,
  isFirstEntry = false,
}: {
  entry: JournalEntry;
  initialReflection?: Reflection | null;
  isFirstEntry?: boolean;
}) {
  const router = useRouter();
  const { planType, credits, loading, refresh } = useUserPlan();
  const { t, locale } = useTranslation();
  const ps = t.pricingStrings;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [busy, setBusy] = useState(false);
  const [reflection, setReflection] = useState<Reflection | null>(initialReflection ?? null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isUnlimited = planType === "PREMIUM" || planType === "TRIAL";
  const isLimitReached = !isUnlimited && credits === 0;

  const parsedSummary = useMemo(
    () => (reflection ? parseSummary(reflection.summary) : null),
    [reflection?.summary]
  );

  const parsedStep = useMemo(
    () => (reflection ? parseNextStep(reflection.gentlenextstep) : null),
    [reflection?.gentlenextstep]
  );

  const questionsTitle = useMemo(
    () => t.ui.questionsHeading(reflection?.questions?.length ?? 0),
    [reflection?.questions?.length]
  );

  async function generateReflection() {
    // If limit reached, show upgrade modal immediately on click
    if (isLimitReached) { setShowUpgrade(true); return; }
    if (busy || reflection) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, locale }),
      });
      if (res.status === 402) { setShowUpgrade(true); return; }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || t.errors.reflectionFailed);
        return;
      }
      const j = await res.json().catch(() => ({}));
      const receivedReflection = j?.reflection || null;
      setReflection(receivedReflection);
      if (receivedReflection) {
        // The first reflection is the highest-leverage conversion moment (PRODUCT_BRIEF §6).
        // Track it every time so we can funnel: journal_submitted → reflection_received → upgrade.
        track("reflection_received", {
          is_first_entry: isFirstEntry,
          domain: receivedReflection.domain ?? "GENERAL",
          word_count: entry.content.trim().split(/\s+/).filter(Boolean).length,
        });
      }
      await refresh();
    } catch {
      setError(t.errors.reflectionFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/journal/${entry.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setDeleteError(j?.error || t.errors.entryDeleteFailed);
        setDeleting(false);
        return;
      }
      router.push("/journal");
    } catch {
      setDeleteError(t.errors.entryGenericFail);
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10 text-qm-primary">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-snug tracking-tight text-qm-primary sm:text-3xl">
            {entry.title || t.journal.untitled}
          </h1>
          <p className="mt-1 text-xs text-white/35" suppressHydrationWarning>
            {mounted
              ? new Date(entry.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date(entry.created_at).toISOString().slice(0, 10)}
          </p>
        </div>
        <Link
          href="/journal"
          className="mt-1 shrink-0 text-xs text-qm-positive transition-colors hover:text-qm-positive-hover"
        >
          {t.nav.backToJournal}
        </Link>
      </header>

      {/* ── Entry content ───────────────────────────────────────────────── */}
      <article className="whitespace-pre-wrap rounded-2xl border border-white/6 bg-white/[0.03] px-6 py-5 text-sm leading-relaxed text-white/75">
        {entry.content}
      </article>

      {/* ── Reflection card ─────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">

        {isFirstEntry && !reflection && (
          <div className="flex items-start gap-2 border-b border-white/6 bg-qm-positive-bg px-6 py-3">
            <span className="mt-0.5 text-sm text-qm-positive">&#10022;</span>
            <p className="text-xs leading-relaxed text-qm-muted">
              {t.reflection.firstEntryBanner}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white/90">
              {t.reflection.cardHeading}
            </h2>

            {/* Credits counter — only show for free users */}
            {mounted && !isUnlimited && (
              <p className="mt-0.5 text-xs text-white/30">
                {loading ? "…" : t.reflection.creditsRemaining(credits ?? 0)}
                {isLimitReached && (
                  <span className="ms-1 text-qm-warning">
                    · {t.reflection.creditsResetsNext}
                  </span>
                )}
              </p>
            )}
          </div>

          {!reflection ? (
            <button
              onClick={generateReflection}
              disabled={busy}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all disabled:opacity-50 ${
                isLimitReached
                  ? "border border-qm-positive-border bg-qm-positive-soft text-qm-positive hover:bg-qm-positive-soft"
                  : "bg-qm-accent text-white hover:bg-qm-accent-hover"
              }`}
            >
              {busy ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t.reflection.reflectingLabel}
                </>
              ) : isLimitReached ? (
                t.reflection.unlockReflectionLabel
              ) : (
                t.reflection.seeReflectionLabel
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-qm-positive-border bg-qm-positive-strong/[0.06] px-3 py-1.5 text-xs font-medium text-qm-positive">
              <span className="h-1.5 w-1.5 rounded-full bg-qm-positive" />
              {t.reflection.savedToHistory}
            </span>
          )}
        </div>

        {/* ── Limit reached inline nudge ───────────────────────────────── */}
        {isLimitReached && !reflection && !busy && (
          <div className="border-b border-white/5 bg-qm-positive-strong/[0.03] px-6 py-5">
            <p className="text-sm font-medium text-white/80">
              {t.reflection.limitReachedHeadline(PRICING.freeMonthlyCredits)}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-qm-faint">
              {t.reflection.limitReachedBody}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full bg-qm-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
              >
                {ps.startTrialCta(ps.trialLabel(PRICING.trialDays))}
              </Link>
              <Link
                href="/insights/preview"
                className="text-xs font-medium text-qm-faint transition-colors hover:text-qm-secondary"
              >
                {t.upgradeTrigger.seeWhatPremium}
              </Link>
            </div>
            <p className="mt-3 text-[11px] text-qm-faint">
              {t.upgradeTrigger.noCharge(PRICING.trialDays, PRICING.trialDayWord)}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-qm-faint"
              >
                {t.upgradeTrigger.terms}
              </Link>
            </p>
          </div>
        )}

        {error && (
          <p className="mx-6 mt-4 rounded-lg border border-qm-danger-border bg-qm-danger-bg px-4 py-3 text-xs text-qm-danger">
            {error}
          </p>
        )}

        {!reflection && !busy && !isLimitReached && (
          <p className="px-6 py-5 text-xs leading-relaxed text-white/35">
            {t.upgradeTrigger.reflectionIntro}
          </p>
        )}

        {busy && (
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-qm-positive"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/35">{t.reflection.readingEntry}</span>
          </div>
        )}

        {reflection && reflection.crisis ? (
          <div className="space-y-5 px-6 py-6">
            <div className="space-y-3 rounded-xl border border-qm-warning-border bg-qm-warning-bg px-5 py-4">
              <p className="text-sm font-medium text-qm-warning">
                {t.reflection.crisisMatters}
              </p>
              <p className="text-xs leading-relaxed text-white/60">
                {reflection.message}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {t.reflection.crisisSupportLabel}
              </p>
              {(reflection.resources ?? []).map((r) => (
                <div
                  key={r.label}
                  className="flex items-start justify-between gap-3 rounded-lg border border-white/6 bg-white/[0.03] px-4 py-2.5"
                >
                  <span className="text-xs text-white/60">{r.label}</span>
                  <span className="shrink-0 text-xs font-medium text-qm-positive">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/25">
              {t.reflection.crisisPrivacy}
            </p>
          </div>
        ) : reflection ? (
          <div className="divide-y divide-white/5" suppressHydrationWarning>

            {parsedSummary && (
              <div className="space-y-4 px-6 py-5">
                {parsedSummary.carrying && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-qm-positive">
                      {t.reflection.whatYoureCarrying}
                    </p>
                    <p className="text-sm leading-relaxed text-white/90">
                      {parsedSummary.carrying}
                    </p>
                  </div>
                )}
                {parsedSummary.happening && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      {t.reflection.whatsReallyHappening}
                    </p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {parsedSummary.happening}
                    </p>
                  </div>
                )}
                {parsedSummary.deeper && (
                  <div className="rounded-xl border border-qm-positive-border bg-qm-positive-bg px-4 py-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-qm-positive">
                      {t.reflection.deeperDirection}
                    </p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {parsedSummary.deeper}
                    </p>
                  </div>
                )}
              </div>
            )}

            {reflection.corepattern && (
              <div className="px-6 py-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {parsedSummary?.happening ? t.reflection.keyPattern : t.reflection.whatsReallyHappening}
                </p>
                <p className="text-sm italic leading-relaxed text-white/80">
                  {reflection.corepattern}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5 px-6 py-5">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {t.reflection.themesLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reflection.themes.filter(Boolean).map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {t.reflection.emotionsLabel}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reflection.emotions.filter(Boolean).map((e, i) => (
                    <span
                      key={`${e}-${i}`}
                      className="rounded-full border px-2.5 py-1 text-xs"
                      style={emotionStyle(e)}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {parsedStep && (
              <div className="space-y-3 px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {t.reflection.gentleNextStep}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {parsedStep.optionA && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="mb-1 text-[10px] font-semibold text-qm-positive">
                        {t.reflection.optionA}
                      </p>
                      <p className="text-xs leading-relaxed text-white/70">
                        {parsedStep.optionA}
                      </p>
                    </div>
                  )}
                  {parsedStep.optionB && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="mb-1 text-[10px] font-semibold text-white/30">
                        {t.reflection.optionB}
                      </p>
                      <p className="text-xs leading-relaxed text-white/70">
                        {parsedStep.optionB}
                      </p>
                    </div>
                  )}
                </div>
                {parsedStep.script && (
                  <div className="rounded-xl border border-qm-positive-border bg-qm-positive-bg px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold text-qm-positive">
                      {t.reflection.scriptLine}
                    </p>
                    <p className="text-sm italic text-white/75">
                      &ldquo;{parsedStep.script}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            )}

            {reflection.questions?.length > 0 && (
              <div className="px-6 py-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {questionsTitle}
                </p>
                <ol className="space-y-2.5">
                  {reflection.questions.filter(Boolean).map((q, i) => (
                    <li key={`${q}-${i}`} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 text-[10px] font-semibold text-white/30">
                        {i + 1}
                      </span>
                      <span className="text-white/70">{q}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="px-6 py-3">
              <p className="text-center text-[10px] text-white/18">
                {t.reflection.savedPermanently}
              </p>
            </div>

          </div>
        ) : null}
      </section>

      {/* ── Post-reflection bridge ─────────────────────────────────────────── */}
      {reflection && !reflection.crisis && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5">
          {isUnlimited ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/80">
                  {t.reflection.patternHistoryNote}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-qm-faint">
                  {t.reflection.patternHistorySub}
                </p>
              </div>
              <Link
                href="/insights"
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-qm-positive-border bg-qm-positive-strong/[0.06] px-4 py-2.5 text-xs font-semibold text-qm-positive transition hover:bg-qm-positive-strong/[0.12] hover:text-qm-positive-hover"
              >
                {t.reflection.seeFullPattern}
              </Link>
            </div>
          ) : isFirstEntry ? (() => {
            // First-entry free users: show the time-span pattern nudge.
            // This fires at the highest-leverage conversion moment (PRODUCT_BRIEF §6)
            // — while recognition from the first reflection is still fresh.
            const frn = t.firstReflectionNudge;
            return (
              <div>
                {/* Thin accent rule — visual breath between reflection and nudge */}
                <div
                  className="mb-5 h-px w-8"
                  style={{ backgroundColor: "var(--qm-accent-border)" }}
                />
                <p className="text-sm font-semibold text-white/85">
                  {frn.heading}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-qm-faint">
                  {frn.body}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Link
                    href="/upgrade"
                    onClick={() => track("upgrade_modal_opened", { source: "first_reflection_nudge" })}
                    className="inline-flex items-center gap-2 rounded-full bg-qm-accent px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-qm-accent-hover hover:-translate-y-px"
                  >
                    {frn.cta}
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-qm-faint">
                  {frn.noCharge}
                </p>
              </div>
            );
          })() : (() => {
            const domain = reflection.domain ?? "GENERAL";
            const ctaCopy: Record<string, { headline: string; sub: string }> = {
              WORK:         { headline: t.upgradeTrigger.workHeadline,         sub: t.upgradeTrigger.workSub },
              RELATIONSHIP: { headline: t.upgradeTrigger.relationshipHeadline, sub: t.upgradeTrigger.relationshipSub },
              HEALTH:       { headline: t.upgradeTrigger.healthHeadline,       sub: t.upgradeTrigger.healthSub },
              IDENTITY:     { headline: t.upgradeTrigger.identityHeadline,     sub: t.upgradeTrigger.identitySub },
              GRIEF:        { headline: t.upgradeTrigger.griefHeadline,        sub: t.upgradeTrigger.griefSub },
              MONEY:        { headline: t.upgradeTrigger.moneyHeadline,        sub: t.upgradeTrigger.moneySub },
              PARENTING:    { headline: t.upgradeTrigger.parentingHeadline,    sub: t.upgradeTrigger.parentingSub },
              CREATIVE:     { headline: t.upgradeTrigger.creativeHeadline,     sub: t.upgradeTrigger.creativeSub },
              FITNESS:      { headline: t.upgradeTrigger.fitnessHeadline,      sub: t.upgradeTrigger.fitnessSub },
              GENERAL:      { headline: t.upgradeTrigger.generalHeadline,      sub: t.upgradeTrigger.generalSub },
            };
            const copy = ctaCopy[domain] ?? ctaCopy.GENERAL;
            return (
              <div>
                <p className="text-sm font-medium text-white/80">{copy.headline}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-qm-faint">
                  {copy.sub}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-2 rounded-full bg-qm-accent px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-qm-accent-hover"
                  >
                    {ps.startTrialCta(ps.trialLabel(PRICING.trialDays))}
                  </Link>
                  <Link
                    href="/insights/preview"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-qm-muted transition hover:border-white/[0.15] hover:text-qm-primary"
                  >
                    {t.upgradeTrigger.seeExample}
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-qm-faint">
                  {t.upgradeTrigger.noCharge(PRICING.trialDays, PRICING.trialDayWord)}
                  <Link
                    href="/terms"
                    className="underline underline-offset-2 transition-colors hover:text-qm-secondary"
                  >
                    {t.upgradeTrigger.terms}
                  </Link>
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Delete entry ─────────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.04] pt-6">
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-xs text-white/20 transition-colors hover:text-white/40"
          >
            {t.journal.removeEntryLabel}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/40">
              {t.journal.deleteWarning}
            </p>
            {deleteError && (
              <p className="text-xs text-qm-danger">{deleteError}</p>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-medium text-qm-danger transition-colors hover:text-qm-danger disabled:opacity-50"
              >
                {deleting ? t.journal.deletingLabel : t.journal.deleteConfirmLabel}
              </button>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                {t.journal.cancelLabel}
              </button>
            </div>
          </div>
        )}
      </div>

      <UpgradeTriggerModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title={t.reflection.limitReachedHeadline(PRICING.freeMonthlyCredits)}
        message={`${ps.trialFreeFor(PRICING.trialDays)} — ${ps.fullAccess}. ${ps.cancelAnytimeLong}.`}
        source="reflection_limit"
        ctaHref="/upgrade"
        ctaLabel={ps.startTrialCta(ps.trialLabel(PRICING.trialDays))}
      />
    </div>
  );
}
