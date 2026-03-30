"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserPlan } from "@/app/components/useUserPlan";
import UpgradeTriggerModal from "@/app/components/UpgradeTriggerModal";
import { PRICING } from "@/app/lib/pricing";

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

function questionsHeading(count: number): string {
  if (count <= 0) return "Questions";
  if (count === 1) return "1 Question";
  return `${count} Questions`;
}

const EMOTION_COLORS: Record<string, string> = {
  anxiety: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  anxious: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  fear: "bg-red-500/15 text-red-300 border-red-500/25",
  scared: "bg-red-500/15 text-red-300 border-red-500/25",
  uncertainty: "bg-slate-500/20 text-slate-300 border-slate-500/25",
  grief: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  sadness: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  longing: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  guilt: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  shame: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  frustration: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  anger: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  confusion: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  overwhelm: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  hope: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  pride: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  love: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  hurt: "bg-red-500/15 text-red-300 border-red-500/25",
  tiredness: "bg-slate-500/20 text-slate-300 border-slate-500/25",
  exhaustion: "bg-slate-500/20 text-slate-300 border-slate-500/25",
};

function emotionClass(e: string): string {
  return EMOTION_COLORS[e.toLowerCase()] ?? "bg-white/5 text-white/60 border-white/10";
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
    () => questionsHeading(reflection?.questions?.length ?? 0),
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
        body: JSON.stringify({ entryId: entry.id }),
      });
      if (res.status === 402) { setShowUpgrade(true); return; }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "We couldn't generate a reflection right now.");
        return;
      }
      const j = await res.json().catch(() => ({}));
      setReflection(j?.reflection || null);
      await refresh();
    } catch {
      setError("We couldn't generate a reflection right now.");
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
        setDeleteError(j?.error || "Could not delete this entry. Try again.");
        setDeleting(false);
        return;
      }
      router.push("/journal");
    } catch {
      setDeleteError("Something went wrong. Try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10 text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
            {entry.title || "Untitled"}
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
          className="mt-1 shrink-0 text-xs text-emerald-400/70 transition-colors hover:text-emerald-300"
        >
          &larr; Back to journal
        </Link>
      </header>

      {/* ── Entry content ───────────────────────────────────────────────── */}
      <article className="whitespace-pre-wrap rounded-2xl border border-white/6 bg-white/[0.03] px-6 py-5 text-sm leading-relaxed text-white/75">
        {entry.content}
      </article>

      {/* ── Reflection card ─────────────────────────────────────────────── */}
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">

        {isFirstEntry && !reflection && (
          <div className="flex items-start gap-2 border-b border-white/6 bg-emerald-500/5 px-6 py-3">
            <span className="mt-0.5 text-sm text-emerald-400">&#10022;</span>
            <p className="text-xs leading-relaxed text-slate-400">
              This reflection starts your pattern history &mdash; Quiet Mirror will
              notice what repeats across your entries over time.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-white/90">
              Quiet Mirror&apos;s reflection
            </h2>

            {/* Credits counter — only show for free users */}
            {mounted && !isUnlimited && (
              <p className="mt-0.5 text-xs text-white/30">
                {loading ? "…" : credits}{" "}
                {credits === 1 ? "reflection" : "reflections"} remaining
                this month
                {isLimitReached && (
                  <span className="ml-1 text-amber-400/60">
                    · resets next month
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
                  ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-[color:var(--hvn-accent-mint)] text-white hover:bg-[color:var(--hvn-accent-mint-hover)]"
              }`}
            >
              {busy ? (
                <>
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Reflecting&hellip;
                </>
              ) : isLimitReached ? (
                "Unlock this reflection →"
              ) : (
                "See reflection"
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-400/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Saved to your history
            </span>
          )}
        </div>

        {/* ── Limit reached inline nudge ───────────────────────────────── */}
        {isLimitReached && !reflection && !busy && (
          <div className="border-b border-white/5 bg-emerald-500/[0.03] px-6 py-5">
            <p className="text-sm font-medium text-white/80">
              You&apos;ve used your {PRICING.freeMonthlyCredits} free reflections this month.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Premium unlocks unlimited reflections on every entry — plus
              pattern insights across time, a weekly summary, and the
              why-this-keeps-happening layer.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/upgrade"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[color:var(--hvn-accent-mint-hover)] hover:-translate-y-px"
              >
                {`Start ${PRICING.trialLabel} →`}
              </Link>
              <Link
                href="/insights/preview"
                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
              >
                See what Premium shows
              </Link>
            </div>
            <p className="mt-3 text-[11px] text-slate-700">
              {`🛡️ No charge for ${PRICING.trialDays} ${PRICING.trialDays === 1 ? "day" : "days"} · Cancel anytime · `}{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-slate-500"
              >
                Terms
              </Link>
            </p>
          </div>
        )}

        {error && (
          <p className="mx-6 mt-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {!reflection && !busy && !isLimitReached && (
          <p className="px-6 py-5 text-xs leading-relaxed text-white/35">
            When you&apos;re ready, Quiet Mirror will reflect back what it noticed
            &mdash; themes, emotions, and a gentle next step. Each entry gets
            one reflection, saved permanently so your patterns stay accurate
            over time.
          </p>
        )}

        {busy && (
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400/60"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/35">Reading your entry&hellip;</span>
          </div>
        )}

        {reflection && reflection.crisis ? (
          <div className="space-y-5 px-6 py-6">
            <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-sm font-medium text-amber-300/90">
                What you wrote matters, and you matter.
              </p>
              <p className="text-xs leading-relaxed text-white/60">
                {reflection.message}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                If you need support right now
              </p>
              {(reflection.resources ?? []).map((r) => (
                <div
                  key={r.label}
                  className="flex items-start justify-between gap-3 rounded-lg border border-white/6 bg-white/[0.03] px-4 py-2.5"
                >
                  <span className="text-xs text-white/60">{r.label}</span>
                  <span className="shrink-0 text-xs font-medium text-emerald-400/80">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/25">
              Your entries are always private &middot; You don&apos;t have to
              figure this out alone
            </p>
          </div>
        ) : reflection ? (
          <div className="divide-y divide-white/5" suppressHydrationWarning>

            {parsedSummary && (
              <div className="space-y-4 px-6 py-5">
                {parsedSummary.carrying && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/60">
                      What you&apos;re carrying
                    </p>
                    <p className="text-sm leading-relaxed text-white/90">
                      {parsedSummary.carrying}
                    </p>
                  </div>
                )}
                {parsedSummary.happening && (
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      What&apos;s really happening
                    </p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {parsedSummary.happening}
                    </p>
                  </div>
                )}
                {parsedSummary.deeper && (
                  <div className="rounded-xl border border-emerald-500/12 bg-emerald-500/5 px-4 py-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-400/50">
                      Deeper direction
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
                  {parsedSummary?.happening ? "Key pattern" : "What's really happening"}
                </p>
                <p className="text-sm italic leading-relaxed text-white/80">
                  {reflection.corepattern}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-5 px-6 py-5">
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Themes
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
                  Emotions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {reflection.emotions.filter(Boolean).map((e, i) => (
                    <span
                      key={`${e}-${i}`}
                      className={`rounded-full border px-2.5 py-1 text-xs ${emotionClass(e)}`}
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
                  Gentle Next Step
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {parsedStep.optionA && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="mb-1 text-[10px] font-semibold text-emerald-400/60">
                        Option A
                      </p>
                      <p className="text-xs leading-relaxed text-white/70">
                        {parsedStep.optionA}
                      </p>
                    </div>
                  )}
                  {parsedStep.optionB && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="mb-1 text-[10px] font-semibold text-white/30">
                        Option B
                      </p>
                      <p className="text-xs leading-relaxed text-white/70">
                        {parsedStep.optionB}
                      </p>
                    </div>
                  )}
                </div>
                {parsedStep.script && (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
                    <p className="mb-1 text-[10px] font-semibold text-emerald-400/50">
                      Script line
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
                Saved permanently &middot; Quiet Mirror uses this to build your
                pattern history
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
                  This is now part of your pattern history.
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Quiet Mirror tracks what keeps showing up across all your entries.
                  Your insights view shows the thread that connects them.
                </p>
              </div>
              <Link
                href="/insights"
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-2.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/[0.12] hover:text-emerald-300"
              >
                See your full pattern →
              </Link>
            </div>
          ) : (() => {
            const domain = reflection.domain ?? "GENERAL";
            const ctaCopy: Record<string, { headline: string; sub: string }> = {
              WORK: {
                headline: "You wrote about work pressing in.",
                sub: "Premium shows you when this pattern repeats — and what it has in common across weeks. Most people are surprised by what they find.",
              },
              RELATIONSHIP: {
                headline: "You wrote about a relationship that's sitting with you.",
                sub: "Premium shows you when this kind of thing keeps coming back — the emotional thread across your entries that's hard to see from inside it.",
              },
              HEALTH: {
                headline: "You wrote about running on empty.",
                sub: "Premium tracks when exhaustion keeps surfacing and what it tends to show up alongside. The pattern usually starts earlier than people realise.",
              },
              IDENTITY: {
                headline: "You wrote about not feeling like yourself.",
                sub: "Premium shows you the version of yourself that keeps recurring in your entries — and what tends to pull you away from it.",
              },
              GRIEF: {
                headline: "You wrote about loss.",
                sub: "Premium shows how grief surfaces and shifts across your entries over time. Sometimes the pattern reveals what still needs to be said.",
              },
              MONEY: {
                headline: "You wrote about financial pressure.",
                sub: "Premium shows when money stress keeps returning and what it tends to trigger alongside it. The pattern is rarely just about the numbers.",
              },
              PARENTING: {
                headline: "You wrote about being a parent.",
                sub: "Premium shows the emotional patterns in how you show up — the recurring moments, what triggers them, and what shifts over time.",
              },
              CREATIVE: {
                headline: "You wrote about a creative block.",
                sub: "Premium shows when this surfaces, what it follows, and whether it's getting better or worse. The pattern is usually not what you think.",
              },
              FITNESS: {
                headline: "You wrote about your body.",
                sub: "Premium tracks the emotional patterns around how you feel about your physical self — what shifts, what stays, and what it connects to.",
              },
              GENERAL: {
                headline: "This reflection is now part of your pattern history.",
                sub: "Premium shows you what keeps repeating across your entries — the emotional thread you can't always see from inside it.",
              },
            };
            const copy = ctaCopy[domain] ?? ctaCopy.GENERAL;
            return (
              <div>
                <p className="text-sm font-medium text-white/80">{copy.headline}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {copy.sub}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/upgrade"
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--hvn-accent-mint)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--hvn-accent-mint-hover)]"
                  >
                    {`Start ${PRICING.trialLabel} →`}
                  </Link>
                  <Link
                    href="/insights/preview"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.15] hover:text-slate-200"
                  >
                    See an example
                  </Link>
                </div>
                <p className="mt-3 text-[11px] text-slate-700">
                  {`🛡️ No charge for ${PRICING.trialDays} ${PRICING.trialDays === 1 ? "day" : "days"} · Cancel anytime ·`}{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-2 transition-colors hover:text-slate-500"
                  >
                    Terms
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
            Remove this entry
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/40">
              This will permanently delete the entry and its reflection. This
              cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs text-red-400">{deleteError}</p>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-medium text-red-400/80 transition-colors hover:text-red-400 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteError(null); }}
                className="text-xs text-white/30 transition-colors hover:text-white/60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <UpgradeTriggerModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title={`You've used your ${PRICING.freeMonthlyCredits} free reflections this month.`}
        message={`Start a free trial to keep reflecting on every entry — no charge for ${PRICING.trialDays} ${PRICING.trialDays === 1 ? "day" : "days"}, cancel anytime before then.`}
        source="reflection_limit"
        ctaHref="/upgrade"
        ctaLabel={`Start ${PRICING.trialLabel} →`}
      />
    </div>
  );
}
