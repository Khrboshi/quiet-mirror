// app/(protected)/tools/reflection/page.tsx
/**
 * app/(protected)/tools/reflection/page.tsx
 *
 * Standalone guided reflection tool — takes a user prompt and returns
 * a structured AI reflection without requiring a journal entry.
 * Premium/Trial only.
 */
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import RequirePremium from "@/app/components/RequirePremium";
import { useTranslation } from "@/app/components/I18nProvider";

type State =
  | { status: "loading" }
  | { status: "ready"; question: string; hasData: boolean }
  | { status: "error" };

export default function ReflectionToolPage() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: "loading" });

  const fetchQuestion = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/tools/reflection", { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (!data?.question) throw new Error("No question returned");
      setState({ status: "ready", question: data.question, hasData: data.hasData ?? true });
    } catch {
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return (
    <RequirePremium>
      <div className="min-h-screen w-full bg-qm-bg px-6 py-10 text-qm-primary">
        <div className="mx-auto max-w-2xl space-y-8">

          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-positive-muted">
              Premium · Guided Reflection
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              One question worth sitting with.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed text-qm-muted">
              Quiet Mirror reads what keeps showing up across your entries and shapes a question
              around what you seem to be carrying. Not a prompt to perform with — just
              something to sit with honestly.
            </p>
          </header>

          <div className="relative overflow-hidden rounded-3xl border border-qm-positive-border bg-qm-positive-strong/[0.03]">
            <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b from-qm-positive-strong/[0.06] to-transparent" />
            <div className="relative px-7 py-8">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-qm-positive">
                Your reflection question
              </p>

              {state.status === "loading" && (
                <div className="space-y-3 py-2">
                  <div className="h-6 w-3/4 animate-pulse rounded-lg bg-qm-card" />
                  <div className="h-6 w-1/2 animate-pulse rounded-lg bg-qm-card" />
                </div>
              )}

              {state.status === "error" && (
                <div className="space-y-4">
                  <p className="text-sm text-qm-muted">
                    {t.tools.somethingWentWrong("question")}
                  </p>
                  <button
                    onClick={fetchQuestion}
                    className="text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
                  >
                    Try again →
                  </button>
                </div>
              )}

              {state.status === "ready" && (
                <div className="space-y-6">
                  <p className="font-display text-xl font-medium leading-relaxed text-qm-primary sm:text-2xl">
                    {state.question}
                  </p>
                  {!state.hasData && (
                    <p className="text-xs text-qm-faint">
                      Write a few entries and generate reflections to get a question shaped around your patterns.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link
                      href={`/journal/new?prompt=${encodeURIComponent(state.question)}`}
                      className="inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[color:var(--qm-accent-soft)] transition-all hover:bg-qm-accent-hover hover:-translate-y-px"
                    >
                      Write about this →
                    </Link>
                    <button
                      onClick={fetchQuestion}
                      className="text-sm text-qm-faint transition-colors hover:text-qm-secondary"
                    >
                      Get a different question
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-qm-border-subtle bg-qm-elevated px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
              How this works
            </p>
            <p className="mt-3 text-sm leading-relaxed text-qm-muted">
              Quiet Mirror reads across your recent entries — the emotions, themes, and patterns
              that keep returning — and shapes a question around what it notices. The question
              changes as your writing does. It is not a prompt to answer correctly. Just
              something honest to sit with.
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
