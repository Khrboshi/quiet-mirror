// app/(protected)/insights/InsightsClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUserPlan } from "@/app/components/useUserPlan";

type InsightData = {
  themes: Record<string, number>;
  emotions: Record<string, number>;

  // Optional (safe to ignore if API doesn't return them yet)
  corepatterns?: Record<string, number>;
  entryCount?: number;
  trend?: { up: string[]; down: string[] };
};

function sortMap(map: Record<string, number>) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function maxVal(map: Record<string, number>): number {
  const vals = Object.values(map);
  return vals.length ? Math.max(...vals) : 1;
}

// ── Bar row used in theme/emotion lists ─────────────────────────────────────

function BarRow({
  label,
  count,
  max,
  rank,
}: {
  label: string;
  count: number;
  max: number;
  rank: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const isTop = rank === 0;

  return (
    <li className="group space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span
          className={
            isTop
              ? "font-medium text-slate-100"
              : "text-slate-300 transition-colors group-hover:text-slate-100"
          }
        >
          {label}
        </span>
        <span className="tabular-nums text-xs text-slate-500">{count}</span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isTop ? "bg-emerald-400" : "bg-slate-600 group-hover:bg-slate-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

// ── Skeleton loader ──────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Summary skeleton */}
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
        <div className="h-3.5 w-20 rounded bg-slate-800" />
        <div className="h-3 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-6"
          >
            <div className="h-3 w-24 rounded bg-slate-800" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded bg-slate-800" />
                  <div className="h-3 w-6 rounded bg-slate-800" />
                </div>
                <div className="h-1 w-full rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Trend badge ──────────────────────────────────────────────────────────────

function TrendBadge({ label, direction }: { label: string; direction: "up" | "down" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        direction === "up"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-700/40 text-slate-400"
      }`}
    >
      {direction === "up" ? "↑" : "↓"} {label}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function InsightsClient() {
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { planType, loading: planLoading } = useUserPlan();
  const isPremium = planType === "PREMIUM" || planType === "TRIAL";

  useEffect(() => {
    async function load() {
      setError(null);

      try {
        const res = await fetch("/api/ai/insights", { cache: "no-store" });

        if (!res.ok) {
          const j = await res.json().catch(() => ({} as any));
          setError(j?.error || "Failed to load insights.");
          setData(null);
          return;
        }

        const j = (await res.json()) as InsightData;

        // Best-effort fallback until API includes entryCount:
        // Use the max occurrence count across themes/emotions as a rough “enough data” signal.
        const derivedCount = Math.max(
          ...Object.values(j.themes || {}),
          ...Object.values(j.emotions || {}),
          0
        );

        setData({ ...j, entryCount: typeof j.entryCount === "number" ? j.entryCount : derivedCount });
      } catch {
        setError("Failed to load insights.");
        setData(null);
      }
    }

    load();
  }, []);

  const topThemes = useMemo(() => (data ? sortMap(data.themes) : []), [data]);
  const topEmotions = useMemo(() => (data ? sortMap(data.emotions) : []), [data]);
  const topCorepatterns = useMemo(
    () => (data?.corepatterns ? sortMap(data.corepatterns).slice(0, 5) : []),
    [data]
  );

  const maxTheme = useMemo(() => (data ? maxVal(data.themes) : 1), [data]);
  const maxEmotion = useMemo(() => (data ? maxVal(data.emotions) : 1), [data]);
  const maxPattern = useMemo(() => (data?.corepatterns ? maxVal(data.corepatterns) : 1), [data]);

  const topEmotion = topEmotions[0]?.[0];
  const topEmotionCount = topEmotions[0]?.[1];

  const topTheme = topThemes[0]?.[0];
  const topThemeCount = topThemes[0]?.[1];

  const entryCount = data?.entryCount ?? 0;
  const hasAnyInsights = topThemes.length > 0 || topEmotions.length > 0;

  const hasTrend =
    (data?.trend?.up?.length ?? 0) > 0 || (data?.trend?.down?.length ?? 0) > 0;

  // Upsell: FREE only, and avoid flicker while plan is loading.
  const showUpgradePrompt = !planLoading && !isPremium && (data?.entryCount ?? 0) >= 5;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Insights</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Patterns generated quietly across your entries — never from a single moment.
          {entryCount > 0 && (
            <span className="ml-1 text-slate-500">
              ({entryCount} {entryCount === 1 ? "entry" : "entries"} with reflections)
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Loading */}
      {!error && !data && <Skeleton />}

      {/* Content */}
      {data && (
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Summary
            </h2>

            {!hasAnyInsights ? (
              <p className="text-sm text-slate-500">
                No patterns yet. Keep writing — after a few more reflections Havenly will start noticing what repeats quietly over time.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="max-w-2xl space-y-2 text-sm text-slate-300 leading-relaxed">
                  {topEmotion && (
                    <p>
                      Recently,{" "}
                      <span className="font-medium text-slate-100">{topEmotion}</span>{" "}
                      shows up most often
                      {typeof topEmotionCount === "number" ? (
                        <> ({topEmotionCount} times)</>
                      ) : null}
                      .
                    </p>
                  )}

                  {topTheme && (
                    <p>
                      A recurring theme is{" "}
                      <span className="font-medium text-slate-100">{topTheme}</span>
                      {typeof topThemeCount === "number" ? <> ({topThemeCount} times)</> : null}.
                    </p>
                  )}

                  <p className="text-slate-400">
                    These are patterns, not labels — and they shift as you keep writing.
                  </p>
                </div>

                {/* Trend badges */}
                {hasTrend && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.trend?.up?.map((e) => (
                      <TrendBadge key={`up-${e}`} label={e} direction="up" />
                    ))}
                    {data.trend?.down?.map((e) => (
                      <TrendBadge key={`down-${e}`} label={e} direction="down" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Upsell (FREE only) */}
          {showUpgradePrompt && (
            <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-100">
                    Ready for deeper patterns?
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-emerald-200/80">
                    Premium Insights adds deeper multi-entry themes, weekly “how have I really been?” summaries, and richer reflections.
                  </p>
                </div>

                <Link
                  href="/upgrade?from=insights"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  See Premium →
                </Link>
              </div>
            </section>
          )}

          {/* Core patterns */}
          {topCorepatterns.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                What you keep coming back to
              </h2>
              <p className="mb-4 text-xs text-slate-600">
                The underlying dynamic Havenly noticed most across your reflections.
              </p>

              <ul className="space-y-4">
                {topCorepatterns.map(([pattern, count], i) => (
                  <li key={pattern} className="group space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={`text-sm leading-snug ${
                          i === 0
                            ? "font-medium text-slate-100"
                            : "text-slate-400 transition-colors group-hover:text-slate-300"
                        }`}
                      >
                        {pattern}
                      </p>
                      <span className="shrink-0 tabular-nums pt-0.5 text-xs text-slate-600">
                        {count}×
                      </span>
                    </div>

                    <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          i === 0 ? "bg-emerald-400/60" : "bg-slate-700"
                        }`}
                        style={{
                          width: `${Math.round((count / maxPattern) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Themes + Emotions */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recurring themes
              </h2>

              {topThemes.length === 0 ? (
                <p className="text-sm text-slate-600">No theme data yet.</p>
              ) : (
                <ul className="space-y-4">
                  {topThemes.map(([k, v], i) => (
                    <BarRow key={k} label={k} count={v} max={maxTheme} rank={i} />
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Emotions over time
              </h2>

              {topEmotions.length === 0 ? (
                <p className="text-sm text-slate-600">No emotion data yet.</p>
              ) : (
                <ul className="space-y-4">
                  {topEmotions.map(([k, v], i) => (
                    <BarRow key={k} label={k} count={v} max={maxEmotion} rank={i} />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="pb-2 text-center text-xs text-slate-600">
            Insights update each time you generate a new reflection.
          </p>
        </div>
      )}
    </div>
  );
}
