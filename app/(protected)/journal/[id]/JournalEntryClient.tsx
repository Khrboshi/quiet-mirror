// app/(protected)/journal/[id]/JournalEntryClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUserPlan } from "@/app/components/useUserPlan";
import UpgradeTriggerModal from "@/app/components/UpgradeTriggerModal";

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
};

// ─── Summary parser: splits "What you're carrying:" / "What's really happening:" / "Deeper direction:"
function parseSummary(summary: string): { carrying: string; happening: string; deeper: string } {
  const carrying = summary.match(/What you're carrying:\s*([^\n]+(?:\n(?!What's|Deeper)[^\n]+)*)/i)?.[1]?.trim() ?? "";
  const happening = summary.match(/What's really happening:\s*([^\n]+(?:\n(?!Deeper)[^\n]+)*)/i)?.[1]?.trim() ?? "";
  const deeper = summary.match(/Deeper direction:\s*([^\n]+(?:\n[^\n]+)*)/i)?.[1]?.trim() ?? "";
  return { carrying, happening, deeper };
}

// ─── Next step parser: splits Option A, Option B, Script line
function parseNextStep(step: string): { optionA: string; optionB: string; script: string } {
  if (!step) return { optionA: "", optionB: "", script: "" };
  const optionA = step.match(/Option A:\s*(.+?)(?=Option B:|Script line:|$)/is)?.[1]?.trim() ?? "";
  const optionB = step.match(/Option B:\s*(.+?)(?=Script line:|$)/is)?.[1]?.trim() ?? "";
  const scriptRaw = step.match(/Script line:\s*[""\u201c\u2018]?(.+?)[""\u201d\u2019]?\s*$/is)?.[1]?.trim() ?? "";
  const script = scriptRaw.replace(/^["\u201c\u2018]|["\u201d\u2019]$/g, "").trim();
  return { optionA, optionB, script };
}

function getReflectionApiUrl() {
  if (typeof window === "undefined") return "/api/ai/reflection";
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "1" ? "/api/ai/reflection?debug=1" : "/api/ai/reflection";
}

function questionsHeading(count: number): string {
  if (count <= 0) return "Questions";
  if (count === 1) return "1 Question";
  return `${count} Questions`;
}

// ─── Emotion pill color mapping
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
}: {
  entry: JournalEntry;
  initialReflection?: Reflection | null;
}) {
  const { planType, credits, loading, refresh } = useUserPlan();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [busy, setBusy] = useState(false);
  const [reflection, setReflection] = useState<Reflection | null>(initialReflection ?? null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  // `revealed` removed — caused React #425 hydration mismatch.
  // reflection content renders whenever `reflection` is non-null.

  const readablePlan = useMemo(() => {
    if (planType === "PREMIUM") return "Premium";
    if (planType === "TRIAL") return "Trial";
    return "Free";
  }, [planType]);

  const isUnlimited = planType === "PREMIUM" || planType === "TRIAL";

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
    if (busy || reflection) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(getReflectionApiUrl(), {
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

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-10 text-white">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{entry.title || "Untitled"}</h1>
          <p className="mt-0.5 text-xs text-white/35">
            {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
        <Link href="/journal" className="text-xs text-emerald-400/80 hover:text-emerald-300 transition-colors mt-1">
          ← Back to journal
        </Link>
      </header>

      {/* ── Entry content ───────────────────────────────────────────────── */}
      <article className="whitespace-pre-wrap rounded-2xl border border-white/6 bg-white/[0.03] px-6 py-5 text-sm leading-relaxed text-white/75">
        {entry.content}
      </article>

      {/* ── Reflection card ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">

        {/* Card header bar */}
        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">AI Reflection</h2>
            {mounted && (
              <p className="mt-0.5 text-xs text-white/40">
                Plan: <span className="text-emerald-300/90">{readablePlan}</span>
                {!isUnlimited ? (
                  <>
                    {" "}·{" "}
                    <span className="text-white/50">{loading ? "…" : credits} left</span>
                    {credits === 0 && <span className="ml-1.5 text-white/30">(resets monthly)</span>}
                  </>
                ) : (
                  <span className="text-white/30"> · Unlimited</span>
                )}
              </p>
            )}
          </div>

          {!reflection ? (
            <button
              onClick={generateReflection}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-all"
            >
              {busy ? (
                <>
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                  Reflecting…
                </>
              ) : "Generate Reflection"}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saved
              </span>
              <p className="text-[10px] text-white/20">permanent · keeps patterns accurate</p>
            </div>
          )}
        </div>

        {error && (
          <p className="mx-6 mt-4 rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-3 text-xs text-red-300">
            {error}
          </p>
        )}

        {/* Pre-generate placeholder */}
        {!reflection && !busy && (
          <p className="px-6 py-5 text-xs text-white/35 leading-relaxed">
            When you're ready, Havenly will reflect back what it noticed — themes, emotions,
            and a gentle next step. Each entry gets one reflection, saved permanently so your
            patterns stay accurate over time.
          </p>
        )}

        {busy && (
          <div className="flex items-center gap-3 px-6 py-5">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-white/35">Reading your entry…</span>
          </div>
        )}

        {/* ── Reflection body ───────────────────────────────────────────── */}
        {reflection && (
          <div className="divide-y divide-white/5" suppressHydrationWarning>

            {/* ── What you're carrying ─────────────────────────────────── */}
            {parsedSummary && (
              <div className="px-6 py-5 space-y-4">
                {parsedSummary.carrying && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/60 mb-2">
                      What you're carrying
                    </p>
                    <p className="text-sm leading-relaxed text-white/90">
                      {parsedSummary.carrying}
                    </p>
                  </div>
                )}
                {parsedSummary.happening && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                      What's really happening
                    </p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {parsedSummary.happening}
                    </p>
                  </div>
                )}
                {parsedSummary.deeper && (
                  <div className="rounded-xl border border-emerald-500/12 bg-emerald-500/5 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/50 mb-1.5">
                      Deeper direction
                    </p>
                    <p className="text-sm leading-relaxed text-white/70">
                      {parsedSummary.deeper}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ── Key pattern ──────────────────────────────────────────── */}
            {reflection.corepattern && (
              <div className="px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                  Key Pattern
                </p>
                <p className="text-sm leading-relaxed text-white/80 italic">
                  {reflection.corepattern}
                </p>
              </div>
            )}

            {/* ── Themes + Emotions ─────────────────────────────────────── */}
            <div className="px-6 py-5 grid grid-cols-2 gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
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
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
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

            {/* ── Gentle next step ─────────────────────────────────────── */}
            {parsedStep && (
              <div className="px-6 py-5 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  Gentle Next Step
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {parsedStep.optionA && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[10px] font-semibold text-emerald-400/60 mb-1">Option A</p>
                      <p className="text-xs leading-relaxed text-white/70">{parsedStep.optionA}</p>
                    </div>
                  )}
                  {parsedStep.optionB && (
                    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <p className="text-[10px] font-semibold text-white/30 mb-1">Option B</p>
                      <p className="text-xs leading-relaxed text-white/70">{parsedStep.optionB}</p>
                    </div>
                  )}
                </div>
                {parsedStep.script && (
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3">
                    <p className="text-[10px] font-semibold text-emerald-400/50 mb-1">Script line</p>
                    <p className="text-sm text-white/75 italic">"{parsedStep.script}"</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Questions ─────────────────────────────────────────────── */}
            {reflection.questions?.length > 0 && (
              <div className="px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
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

            {/* ── Footer note ───────────────────────────────────────────── */}
            <div className="px-6 py-3">
              <p className="text-center text-[10px] text-white/18">
                Saved permanently · Havenly uses this to build your pattern history
              </p>
            </div>

          </div>
        )}
      </section>

      <UpgradeTriggerModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        title="You've reached your reflection limit"
        message="Upgrade to Premium for unlimited reflections and deeper insights when you need them most."
        source="reflection_limit"
        ctaHref="/upgrade"
        ctaLabel="Upgrade to Premium"
      />
    </div>
  );
}
