// app/(protected)/journal/[id]/JournalEntryClient.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import UpgradeTriggerModal from "@/app/components/UpgradeTriggerModal";

type JournalEntry = {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
};

// field names match AI output
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
  return candidate.length > 180 ? candidate.slice(0, 177).trim() + "…" : candidate;
}

function questionsHeading(count: number): string {
  if (count <= 0) return "Questions";
  if (count === 1) return "1 Question";
  return `${count} Questions`;
}

function getReflectionApiUrl() {
  if (typeof window === "undefined") return "/api/ai/reflection";
  const params = new URLSearchParams(window.location.search);
  const debug = params.get("debug");
  return debug === "1" ? "/api/ai/reflection?debug=1" : "/api/ai/reflection";
}

type ReflectionApiOk = {
  reflection: Reflection;
  remainingCredits: number | null;
};

export default function JournalEntryClient({
  entry,
  initialReflection,
}: {
  entry: JournalEntry;
  initialReflection?: Reflection | null;
}) {
  const [busy, setBusy] = useState(false);
  const [reflection, setReflection] = useState<Reflection | null>(initialReflection ?? null);
  const [error, setError] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Authoritative display state comes from the reflection API response.
  // null = unlimited (Premium), number = free credits left.
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);
  const [planLabel, setPlanLabel] = useState<"Free" | "Premium">("Free");
  const [planKnown, setPlanKnown] = useState(false);

  const readablePlan = useMemo(() => planLabel, [planLabel]);

  const keyPattern = useMemo(() => {
    const core = (reflection?.corepattern || "").trim();
    if (core) return core;
    if (!reflection?.summary) return "";
    return pickKeyPatternFromSummary(reflection.summary);
  }, [reflection?.corepattern, reflection?.summary]);

  const questionsTitle = useMemo(() => {
    const n = reflection?.questions?.length ?? 0;
    return questionsHeading(n);
  }, [reflection?.questions?.length]);

  const planLine = useMemo(() => {
    if (!planKnown) {
      return (
        <>
          Plan: <span className="text-emerald-300">…</span>
        </>
      );
    }

    const isUnlimited = remainingCredits === null;

    return (
      <>
        Plan: <span className="text-emerald-300">{readablePlan}</span>
        {isUnlimited ? (
          <span className="text-white/50"> · Unlimited</span>
        ) : (
          <>
            {" "}
            · Reflections left:{" "}
            <span className="text-emerald-300">{remainingCredits}</span>
            {remainingCredits === 0 && (
              <span className="ml-2 text-xs text-white/50">(resets next month)</span>
            )}
          </>
        )}
      </>
    );
  }, [planKnown, readablePlan, remainingCredits]);

  async function generateReflection() {
    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const res = await fetch(getReflectionApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId: entry.id,
          // Server no longer trusts these, but keeping them does not hurt and avoids breaking older deployments.
          content: entry.content,
          title: entry.title ?? "",
        }),
      });

      if (res.status === 402) {
        setShowUpgrade(true);
        // Plan is known (Free) if we hit a limit.
        setPlanKnown(true);
        setPlanLabel("Free");
        setRemainingCredits(0);
        return;
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j?.error || "We couldn't generate a reflection right now.");
        return;
      }

      const j = (await res.json()) as ReflectionApiOk;

      setReflection(j?.reflection || null);

      // ✅ Authoritative plan display derived from remainingCredits
      if (j && typeof j.remainingCredits !== "undefined") {
        setPlanKnown(true);
        setRemainingCredits(j.remainingCredits);

        if (j.remainingCredits === null) {
          setPlanLabel("Premium");
        } else {
          setPlanLabel("Free");
        }
      } else {
        // If API ever changes, fail closed to Free
        setPlanKnown(true);
        setPlanLabel("Free");
      }
    } catch {
      setError("We couldn't generate a reflection right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-white">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{entry.title || "Untitled"}</h1>
          <p className="mt-1 text-xs text-white/50">{new Date(entry.created_at).toLocaleString()}</p>
        </div>

        <Link href="/journal" className="text-sm text-emerald-400 hover:underline">
          ← Back to journal
        </Link>
      </header>

      <article className="whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-900/60 p-6 leading-relaxed">
        {entry.content}
      </article>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Reflection</h2>

            <p className="mt-1 text-sm text-white/70">{planLine}</p>
          </div>

          <button
            onClick={generateReflection}
            disabled={busy || !!reflection}
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy ? "Generating…" : reflection ? "Reflection Ready ✓" : "Generate Reflection"}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        {!reflection ? (
          <p className="mt-4 text-sm text-white/60">
            When you're ready, Havenly will reflect back themes, emotions, and a gentle next step.
          </p>
        ) : (
          <div className="mt-5 space-y-4 text-sm text-white/80">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="whitespace-pre-wrap text-white/90">{reflection.summary}</p>
            </div>

            {keyPattern && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Key Pattern Detected
                </h3>
                <p className="mt-2 text-white/90">{keyPattern}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">Themes</h3>
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

            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Gentle Next Step
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{reflection.gentlenextstep}</p>
            </div>

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
