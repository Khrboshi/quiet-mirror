// app/(protected)/tools/mood/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import RequirePremium from "@/app/components/RequirePremium";

type Mood = {
  label: string;
  description: string;
  accent: "slate" | "violet" | "amber" | "sky" | "emerald" | "rose";
  prompt: string;
};

const MOODS: Mood[] = [
  {
    label: "Carrying a lot",
    description: "More than usual is weighing on you",
    accent: "slate",
    prompt: "What is weighing on you most right now? You don't need to solve it — just name it honestly.",
  },
  {
    label: "Anxious",
    description: "Something has your mind running",
    accent: "violet",
    prompt: "What is your mind circling around right now? Even if it feels unformed or hard to explain.",
  },
  {
    label: "Tired",
    description: "Drained in a way sleep might not fix",
    accent: "slate",
    prompt: "What has been draining you lately — not just physically, but what has been quietly taking from you?",
  },
  {
    label: "Okay",
    description: "Not great, not bad — just okay",
    accent: "sky",
    prompt: "What does okay actually feel like today? What's sitting just underneath it — the thing you haven't fully named?",
  },
  {
    label: "Unsettled",
    description: "Something feels off, even if you can't name it",
    accent: "amber",
    prompt: "Something feels off. What is it? You don't have to know why — just write what you notice.",
  },
  {
    label: "Clear",
    description: "More settled than usual",
    accent: "emerald",
    prompt: "What is feeling more settled than usual right now? What helped it get there — even quietly, even slowly?",
  },
  {
    label: "Grateful",
    description: "Something good is worth noticing",
    accent: "emerald",
    prompt: "What are you quietly glad for today? Even something small or ordinary — something that doesn't need to be a big deal.",
  },
  {
    label: "Heavy",
    description: "A weight that's been there a while",
    accent: "rose",
    prompt: "What is the heaviest thing you're carrying right now? Say it plainly. You don't have to explain or justify it.",
  },
];

const ACCENT_STYLES: Record<Mood["accent"], { idle: string; active: string; dot: string }> = {
  slate: {
    idle: "border-qm-border-subtle hover:border-qm-border-subtle bg-qm-elevated hover:bg-qm-elevated",
    active: "border-qm-border-subtle bg-qm-card",
    dot: "bg-qm-muted",
  },
  violet: {
    idle: "border-qm-premium-border hover:border-qm-premium-border bg-qm-premium-strong/[0.03] hover:bg-qm-premium-strong/[0.06]",
    active: "border-qm-premium-border bg-qm-premium-strong/[0.08]",
    dot: "bg-qm-premium",
  },
  amber: {
    idle: "border-qm-warning-border hover:border-qm-warning-border bg-qm-warning-strong/[0.03] hover:bg-qm-warning-strong/[0.06]",
    active: "border-qm-warning-border bg-qm-warning-strong/[0.08]",
    dot: "bg-qm-warning",
  },
  sky: {
    idle: "border-qm-premium-border hover:border-qm-premium-border bg-qm-premium-strong/[0.03] hover:bg-qm-premium-strong/[0.06]",
    active: "border-qm-premium-border bg-qm-premium-strong/[0.08]",
    dot: "bg-qm-premium",
  },
  emerald: {
    idle: "border-qm-positive-border hover:border-qm-positive-border bg-qm-positive-strong/[0.03] hover:bg-qm-positive-strong/[0.06]",
    active: "border-qm-positive-border bg-qm-positive-strong/[0.08]",
    dot: "bg-qm-positive",
  },
  rose: {
    idle: "border-qm-danger-border hover:border-qm-danger-border bg-qm-danger-strong/[0.03] hover:bg-qm-danger-strong/[0.06]",
    active: "border-qm-danger-border bg-qm-danger-strong/[0.08]",
    dot: "bg-qm-danger-strong",
  },
};

export default function MoodToolPage() {
  const [selected, setSelected] = useState<Mood | null>(null);

  return (
    <RequirePremium>
      <div className="min-h-screen w-full bg-qm-bg px-6 py-10 text-qm-primary">
        <div className="mx-auto max-w-2xl space-y-8">

          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive-muted">
              Premium · A quiet moment
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              How are you, honestly?
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-qm-muted">
              A quiet check-in. No scores, no ratings — just a moment to pause and notice
              where you actually are. Pick what fits most right now.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((mood) => {
              const styles = ACCENT_STYLES[mood.accent];
              const isActive = selected?.label === mood.label;
              return (
                <button
                  key={mood.label}
                  onClick={() => setSelected(isActive ? null : mood)}
                  className={`group rounded-2xl border px-4 py-4 text-left transition-all duration-150 ${
                    isActive ? styles.active : styles.idle
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-opacity ${styles.dot} ${
                        isActive ? "opacity-100" : "opacity-40 group-hover:opacity-70"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-qm-primary">{mood.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-qm-faint">{mood.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.03] px-6 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
                A prompt for this moment
              </p>
              <p className="mt-3 font-display text-[1.1rem] font-medium leading-relaxed text-qm-primary">
                {selected.prompt}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/journal/new?prompt=${encodeURIComponent(selected.prompt)}`}
                  className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[color:var(--qm-accent-soft)] transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
                >
                  Write about this →
                </Link>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-qm-faint transition-colors hover:text-qm-secondary"
                >
                  Choose a different mood
                </button>
              </div>
            </div>
          )}

          {!selected && (
            <div className="rounded-2xl border border-qm-border-subtle bg-qm-elevated px-6 py-5">
              <p className="text-sm leading-relaxed text-qm-faint">
                Pick the one that feels closest to true right now — even if it only partially fits.
                You don't need to be certain.
              </p>
            </div>
          )}

          <footer className="flex items-center justify-between pt-2">
            <Link href="/tools" className="text-sm text-qm-positive transition-colors hover:text-qm-positive-hover">
              ← Back to Tools
            </Link>
            <Link href="/journal" className="text-sm text-qm-muted transition-colors hover:text-qm-primary">
              Go to journal
            </Link>
          </footer>

        </div>
      </div>
    </RequirePremium>
  );
}
