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

function pickKeyPatternFromSummary(summary: string): string {
  const s = (summary || "").trim();
  if (!s) return "";
  const m = s.match(/^(.+?[.!?])(\s|$)/);
  const firstSentence = m?.[1]?.trim() ?? "";
  const candidate = firstSentence.length >= 40 ? firstSentence : s;
  return candidate.length > 180 ? candidate.slice(0, 177).trim() + "..." : candidate;
}

function questionsHeading(count: number): string {
  if (count <= 0) return "Questions";
  if (count === 1) return "1 Question";
  return `${count} Questions`;
}

function getReflectionApiUrl() {
  if (typeof window === "undefined") return "/api/ai/reflection";
  const params = new URLSearchParams(window.location.search);
  return params.get("debug") === "1" ? "/api/ai/reflection?debug=1" : "/api/ai/reflection";
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
  useEffect(() => setMounted(true), []);

  const [busy, setBusy] = useState(false);
  const [reflection, setReflection] = useState<Reflection | null>(initialReflection ?? null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const readablePlan = useMemo(() => {
    if (planType === "PREMIUM") return "Premium";
    if (planType === "TRIAL") return "Trial";
    return "Free";
  }, [planType]);

  const isUnlimited = planType === "PREMIUM" || planType === "TRIAL";

  const keyPattern = useMemo(() => {
    const core = (reflection?.corepattern || "").trim();
    if (core) return core;
    if (!reflection?.summary) return "";
    return pickKeyPatternFromSummary(reflection.summary);
  }, [reflection?.corepattern, reflection?.summary]);

  const questionsTitle = useMemo(() => {
    return questionsHeading(reflection?.questions?.length ?? 0);
  }, [reflection?.questions?.length]);

  async function generateReflection() {
    // Hard client-side guard — reflection is permanent once generated
    if (busy || reflection) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(getReflectionApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id }),
      });

      if (res.status === 402) {
        setShowUpgrade(true);
        return;
      }

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
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-white">

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{entry.title || "Untitled"}</h1>
          <p className="mt-1 text-xs text-white/50">
            {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
        <Link href="/journal" className="text-sm text-emerald-400 hover:underline">
          &larr; Back to journal
        </Link>
      </header>

      {/* Entry content */}
      <article className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900/60 p-6 leading-relaxed">
        {entry.content}
      </article>

      {/* Reflection section */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">

        {/* Section header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Reflection</h2>
            {mounted && (
              <p className="mt-1 text-sm text-white/70">
                Plan: <span className="text-emerald-300">{readablePlan}</span>
                {!isUnlimited ? (
                  <>
                    {" "}&middot; Reflections left:{" "}
                    <span className="text-emerald-300">{loading ? "..." : credits}</span>
                    {credits === 0 && (
                      <span className="ml-2 text-xs text-white/50">(resets next month)</span>
                    )}
                  </>
                ) : (
                  <span className="text-white/50"> &middot; Unlimited</span>
                )}
              </p>
            )}
          </div>

          {/* Generate button OR locked state */}
          {!reflection ? (
            <button
              onClick={generateReflection}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
            >
              {busy ? "Generating..." : "Generate Reflection"}
            </button>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Reflection saved
              </span>
              <p className="text-[11px] text-white/30">
                Permanent &mdash; keeps your patterns accurate
              </p>
            </div>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {/* Pre-generation state */}
        {!reflection && (
          <p className="mt-4 text-sm text-white/60">
            When you're ready, Havenly will reflect back what it noticed &mdash; themes,
            emotions, and a gentle next step. Each entry gets one reflection, saved permanently
            so your patterns stay accurate over time.
          </p>
        )}

        {/* Reflection content */}
        {reflection && (
          <div className="mt-5 space-y-4 text-sm text-white/80">

            {/* Summary */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="whitespace-pre-wrap text-white/90">{reflection.summary}</p>
            </div>

            {/* Key pattern */}
            {keyPattern && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Key Pattern Detected
                </h3>
                <p className="mt-2 text-white/90">{keyPattern}</p>
              </div>
            )}

            {/* Themes + Emotions */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Themes
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {reflection.themes.map((t, i) => (
                    <li key={`${t}-${i}`}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Emotions
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {reflection.emotions.map((e, i) => (
                    <li key={`${e}-${i}`}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Gentle next step */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Gentle Next Step
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{reflection.gentlenextstep}</p>
            </div>

            {/* Questions */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                {questionsTitle}
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {reflection.questions.map((q, i) => (
                  <li key={`${q}-${i}`}>{q}</li>
                ))}
              </ul>
            </div>

            {/* Permanence note */}
            <p className="text-center text-[11px] text-white/25">
              This reflection is saved permanently &mdash; Havenly uses it to build
              your pattern history accurately over time.
            </p>

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
