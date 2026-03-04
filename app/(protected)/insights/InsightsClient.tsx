// app/(protected)/insights/InsightsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type InsightData = {
  themes: Record<string, number>;
  emotions: Record<string, number>;
};

function sortMap(map: Record<string, number>) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function InsightsClient() {
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        setData(j);
      } catch {
        setError("Failed to load insights.");
        setData(null);
      }
    }
    load();
  }, []);

  const topThemes = useMemo(() => (data ? sortMap(data.themes) : []), [data]);
  const topEmotions = useMemo(() => (data ? sortMap(data.emotions) : []), [data]);

  const topTheme = topThemes[0]?.[0];
  const topThemeCount = topThemes[0]?.[1];

  const topEmotion = topEmotions[0]?.[0];
  const topEmotionCount = topEmotions[0]?.[1];

  const hasAnyInsights = topThemes.length > 0 || topEmotions.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Insights</h1>
        <p className="mt-2 text-sm text-slate-400 max-w-2xl">
          These patterns are generated across multiple entries — never from a single moment.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {!error && !data && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-slate-400 text-sm">
          Loading insights…
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Narrative Summary */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <h2 className="text-sm font-semibold text-slate-200">Summary</h2>

            {!hasAnyInsights ? (
              <p className="mt-3 text-sm text-slate-500">
                No patterns yet. Add a few more entries and Havenly will start noticing themes and emotions over time.
              </p>
            ) : (
              <div className="mt-3 space-y-2 text-sm text-slate-300 max-w-2xl">
                {topEmotion && (
                  <p>
                    Recently, <span className="text-slate-100 font-medium">{topEmotion}</span> shows up most often
                    {typeof topEmotionCount === "number" ? <> ({topEmotionCount} times)</> : null}.
                  </p>
                )}

                {topTheme && (
                  <p>
                    A recurring theme is <span className="text-slate-100 font-medium">{topTheme}</span>
                    {typeof topThemeCount === "number" ? <> ({topThemeCount} times)</> : null}.
                  </p>
                )}

                <p className="text-slate-400">
                  These are patterns, not labels — and they’re generated across multiple entries, not a single day.
                </p>
              </div>
            )}
          </section>

          {/* Existing lists */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Top themes</h2>
              {topThemes.length === 0 ? (
                <p className="text-sm text-slate-500">No theme data yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-200">
                  {topThemes.map(([k, v]) => (
                    <li
                      key={k}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <span>{k}</span>
                      <span className="text-slate-400">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Top emotions</h2>
              {topEmotions.length === 0 ? (
                <p className="text-sm text-slate-500">No emotion data yet.</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-200">
                  {topEmotions.map(([k, v]) => (
                    <li
                      key={k}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                    >
                      <span>{k}</span>
                      <span className="text-slate-400">{v}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
