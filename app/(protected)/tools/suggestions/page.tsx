// app/(protected)/tools/suggestions/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import RequirePremium from "@/app/components/RequirePremium";
import { useTranslation } from "@/app/components/I18nProvider";

type Suggestion = { text: string; prompt: string };

type State =
  | { status: "loading" }
  | { status: "ready"; suggestions: Suggestion[]; hasData: boolean }
  | { status: "error" };

const ACCENT_COLORS = [
  {
    border: "border-qm-positive-border",
    bg: "bg-qm-positive-strong/[0.03]",
    label: "text-qm-positive-muted",
  },
  {
    border: "border-qm-premium-border",
    bg: "bg-qm-premium-strong/[0.03]",
    label: "text-qm-premium-muted",
  },
];

export default function SuggestionsToolPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: "loading" });

  const fetchSuggestions = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/tools/suggestions", { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (!data?.suggestions?.length) throw new Error("No suggestions returned");
      setState({ status: "ready", suggestions: data.suggestions, hasData: data.hasData ?? true });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return (
    <RequirePremium>
      <div className="min-h-screen w-full bg-qm-bg px-6 py-10 text-qm-primary">
        <div className="mx-auto max-w-2xl space-y-8">

          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive">
              Premium · Small Suggestions
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              One or two things worth trying.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-qm-muted">
              Quiet Mirror looks at what keeps coming up in your entries — what drains you,
              what you return to — and offers something small and specific. Not a plan.
              Just a quiet invitation, if it fits.
            </p>
          </header>

          {state.status === "loading" && (
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl border border-qm-border-subtle bg-qm-elevated px-6 py-6">
                  <div className="space-y-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-qm-card" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-qm-card" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-qm-card" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-2xl border border-qm-border-subtle bg-qm-elevated px-6 py-6">
              <p className="text-sm text-qm-muted">
                {t.tools.somethingWentWrong("suggestions")}
              </p>
              <button
                onClick={fetchSuggestions}
                className="mt-4 text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
              >
                Try again →
              </button>
            </div>
          )}

          {state.status === "ready" && (
            <div className="space-y-4">
              {!state.hasData && (
                <p className="pb-1 text-xs text-qm-faint">
                  Write a few entries and generate reflections to get suggestions shaped around your patterns.
                </p>
              )}
              {state.suggestions.map((suggestion, i) => {
                const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
                return (
                  <div key={i} className={`rounded-2xl border ${accent.border} ${accent.bg} px-6 py-6`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${accent.label}`}>
                      {i === 0 ? t.insights.firstSuggestion : t.insights.secondSuggestion}
                    </p>
                    <p className="mt-3 font-display text-[1.05rem] font-medium leading-relaxed text-qm-primary">
                      {suggestion.text}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-qm-muted">
                      {suggestion.prompt}
                    </p>
                    <Link
                      href={`/journal/new?prompt=${encodeURIComponent(suggestion.prompt)}`}
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[color:var(--qm-accent-soft)] transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
                    >
                      Write about this →
                    </Link>
                  </div>
                );
              })}
              <div className="flex justify-end pt-1">
                <button
                  onClick={fetchSuggestions}
                  className="text-sm text-qm-faint transition-colors hover:text-qm-secondary"
                >
                  Get new suggestions
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-qm-border-subtle bg-qm-elevated px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
              How this works
            </p>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">
              These are drawn from what keeps showing up across your entries — not generic
              self-improvement tips. The more you write and reflect, the more specific they
              become. Refresh any time for a fresh pair.
            </p>
          </div>

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
