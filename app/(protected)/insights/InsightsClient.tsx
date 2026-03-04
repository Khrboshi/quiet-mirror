// app/(protected)/insights/InsightsClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type WeeklySeries = { key: string; counts: number[] };
type WeeklyBlock = {
  weeks: string[];
  themes: WeeklySeries[];
  emotions: WeeklySeries[];
};

type InsightData = {
  themes: Record<string, number>;
  emotions: Record<string, number>;
  corepatterns?: Record<string, number>;
  entryCount?: number;
  hasRealData?: boolean;
  trend?: { up: string[]; down: string[] };
  weekly?: WeeklyBlock;
};

function sortMap(map: Record<string, number>) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

function maxVal(map: Record<string, number>): number {
  const vals = Object.values(map);
  return vals.length ? Math.max(...vals) : 1;
}

/**
 * Canonicalization rules:
 * - collapse whitespace
 * - lower-case canonical key for merge
 * - display in Title Case-ish (simple + preserves hyphens)
 */
function canonicalKey(label: string) {
  return (label || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function prettyLabel(label: string) {
  const s = (label || "").trim().replace(/\s+/g, " ");
  if (!s) return s;
  // Keep hyphenated words readable: "self-awareness" -> "Self-awareness"
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Filters out low-signal labels that degrade perceived quality.
 * Tune if needed, but this alone makes the page feel much more premium.
 */
function isLowQualityLabel(label: string) {
  const k = canonicalKey(label);
  if (!k) return true;
  if (k.length > 40) return true;
  if (k.includes("possibly")) return true;
  if (k.includes(" or ")) return true;
  if (k.includes("anxiety")) return false; // keep real emotions if you want; remove if undesired
  return false;
}

/**
 * Merge counts for labels differing only by case/spacing, and drop junk.
 * Returns:
 * - mergedCounts: counts keyed by display label
 * - displayByCanonical: stable display label for each canonical key
 */
function mergeCounts(raw: Record<string, number>) {
  const canonCount: Record<string, number> = {};
  const displayByCanon: Record<string, string> = {};

  for (const [k, v] of Object.entries(raw || {})) {
    const ck = canonicalKey(k);
    if (!ck || isLowQualityLabel(k)) continue;
    const n = typeof v === "number" ? v : 0;
    canonCount[ck] = (canonCount[ck] || 0) + n;

    // Prefer a nicer display (first seen wins, but normalized)
    if (!displayByCanon[ck]) displayByCanon[ck] = prettyLabel(k);
  }

  const mergedCounts: Record<string, number> = {};
  for (const [ck, n] of Object.entries(canonCount)) {
    mergedCounts[displayByCanon[ck] || prettyLabel(ck)] = n;
  }
  return mergedCounts;
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-7 space-y-4">
        <div className="h-3 w-16 rounded bg-slate-800" />
        <div className="h-5 w-2/3 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-5">
            <div className="h-3 w-20 rounded bg-slate-800" />
            {[80, 65, 50, 40].map((w, j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 rounded bg-slate-800" style={{ width: `${w}%` }} />
                  <div className="h-3 w-4 rounded bg-slate-800" />
                </div>
                <div className="h-[3px] w-full rounded-full bg-slate-800" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  rank,
  color = "emerald",
}: {
  label: string;
  count: number;
  max: number;
  rank: number;
  color?: "emerald" | "violet";
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const isTop = rank === 0;

  const barColor =
    isTop
      ? color === "violet"
        ? "bg-violet-400"
        : "bg-emerald-400"
      : "bg-slate-700 group-hover:bg-slate-600";

  const rankColor =
    isTop ? (color === "violet" ? "text-violet-400" : "text-emerald-400") : "text-slate-600";

  return (
    <li className="group space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`shrink-0 tabular-nums text-[10px] w-4 text-right ${rankColor}`}>
            {rank + 1}
          </span>
          <span
            className={`truncate ${
              isTop ? "font-medium text-slate-100" : "text-slate-400 group-hover:text-slate-200 transition-colors"
            }`}
            title={label}
          >
            {label}
          </span>
        </div>
        <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

function TrendPill({ label, dir }: { label: string; dir: "up" | "down" }) {
  const clean = prettyLabel(label);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        dir === "up"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-800/60 text-slate-500"
      }`}
    >
      {dir === "up" ? "↑" : "↓"} {clean}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-200">{value}</p>
    </div>
  );
}

// Simple sparkline with SVG (no libs)
function Sparkline({ data }: { data: number[] }) {
  const w = 120;
  const h = 28;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = Math.max(max - min, 1);

  const pts = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-90">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts} />
    </svg>
  );
}

function NotEnoughData({ entryCount }: { entryCount: number }) {
  const needed = Math.max(0, 5 - entryCount);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-8 text-center space-y-3">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
        <span className="text-xl">✦</span>
      </div>
      <h3 className="text-sm font-medium text-slate-200">
        {entryCount === 0 ? "No reflections yet" : `${entryCount} ${entryCount === 1 ? "reflection" : "reflections"} so far`}
      </h3>
      <p className="mx-auto max-w-sm text-sm text-slate-500">
        {needed > 0
          ? `${needed} more ${needed === 1 ? "reflection" : "reflections"} and Havenly will start surfacing what quietly repeats across your entries.`
          : "Generating your patterns now — check back after your next reflection."}
      </p>
      <Link
        href="/journal/new"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
      >
        Write an entry →
      </Link>
    </div>
  );
}

export default function InsightsClient() {
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllEmotions, setShowAllEmotions] = useState(false);

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

  // Merge + filter at display layer (works even if API is noisy)
  const themesMerged = useMemo(() => (data ? mergeCounts(data.themes) : {}), [data]);
  const emotionsMerged = useMemo(() => (data ? mergeCounts(data.emotions) : {}), [data]);

  const allThemes = useMemo(() => sortMap(themesMerged), [themesMerged]);
  const allEmotions = useMemo(() => sortMap(emotionsMerged), [emotionsMerged]);

  const visibleThemes = showAllThemes ? allThemes : allThemes.slice(0, 6);
  const visibleEmotions = showAllEmotions ? allEmotions : allEmotions.slice(0, 6);

  const maxTheme = useMemo(() => maxVal(themesMerged), [themesMerged]);
  const maxEmotion = useMemo(() => maxVal(emotionsMerged), [emotionsMerged]);

  const entryCount = data?.entryCount ?? 0;

  // “real data” gate
  const derivedHasRealData = (allThemes.length > 0 || allEmotions.length > 0) && entryCount >= 5;
  const hasRealData = typeof data?.hasRealData === "boolean" ? data.hasRealData : derivedHasRealData;

  const topEmotion = allEmotions[0]?.[0];
  const topTheme = allThemes[0]?.[0];

  const hasTrend = (data?.trend?.up?.length ?? 0) + (data?.trend?.down?.length ?? 0) > 0;

  const headline = useMemo(() => {
    if (!topEmotion && !topTheme) return null;
    if (topEmotion && topTheme) {
      return (
        <>
          <span className="text-slate-100 font-semibold">{topEmotion}</span> keeps showing up — often alongside{" "}
          <span className="text-slate-100 font-semibold">{topTheme}</span>.
        </>
      );
    }
    if (topEmotion) {
      return (
        <>
          <span className="text-slate-100 font-semibold">{topEmotion}</span> is the emotion that appears most across your reflections.
        </>
      );
    }
    return (
      <>
        <span className="text-slate-100 font-semibold">{topTheme}</span> is a theme that keeps appearing across your reflections.
      </>
    );
  }, [topEmotion, topTheme]);

  const momentumLabel = useMemo(() => {
    if (!hasTrend) return "Stable";
    const up = data?.trend?.up?.length ?? 0;
    const down = data?.trend?.down?.length ?? 0;
    if (up > down) return "Rising";
    if (down > up) return "Softening";
    return "Shifting";
  }, [data, hasTrend]);

  // Weekly series for sparklines
  const weeklyThemes = data?.weekly?.themes ?? [];
  const weeklyEmotions = data?.weekly?.emotions ?? [];

  const weeklyTopThemes = useMemo(() => weeklyThemes.slice(0, 4), [weeklyThemes]);
  const weeklyTopEmotions = useMemo(() => weeklyEmotions.slice(0, 4), [weeklyEmotions]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-slate-100">Insights</h1>
        <p className="text-sm text-slate-500">
          What Havenly has noticed across your reflections
          {entryCount > 0 && (
            <>
              {" "}
              — <span className="text-slate-400">{entryCount} {entryCount === 1 ? "entry" : "entries"}</span>
            </>
          )}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!error && !data && <Skeleton />}

      {data && !hasRealData && <NotEnoughData entryCount={entryCount} />}

      {data && hasRealData && (
        <div className="space-y-6">
          {/* Headline + KPI strip */}
          <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900/60 p-7">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-600">What this shows</p>
            <p className="mt-2 text-lg leading-relaxed text-slate-300">{headline}</p>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <MiniStat label="Entries" value={`${entryCount}`} />
              <MiniStat label="Top emotion" value={topEmotion || "—"} />
              <MiniStat label="Top theme" value={topTheme || "—"} />
              <MiniStat label="Momentum" value={momentumLabel} />
            </div>

            {hasTrend && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-slate-600 self-center mr-1">Recently:</span>
                {data.trend?.up?.slice(0, 6).map((e) => (
                  <TrendPill key={`up-${e}`} label={e} dir="up" />
                ))}
                {data.trend?.down?.slice(0, 6).map((e) => (
                  <TrendPill key={`dn-${e}`} label={e} dir="down" />
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-slate-600">
              These are patterns, not diagnoses. They shift as you keep writing.
            </p>
          </section>

          {/* Weekly trends (this is the “subscriber value” section) */}
          {(weeklyTopThemes.length > 0 || weeklyTopEmotions.length > 0) && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Weekly trends</h2>
                  <p className="mt-1 text-xs text-slate-600">How your top patterns have moved week-to-week.</p>
                </div>
                <span className="text-xs text-slate-700">Last 8 weeks</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Themes</p>
                  <ul className="space-y-3">
                    {weeklyTopThemes.map((s) => (
                      <li key={`wt-${s.key}`} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-300 truncate" title={s.key}>
                          {prettyLabel(s.key)}
                        </span>
                        <span className="text-emerald-300">
                          <Sparkline data={s.counts} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-3">Emotions</p>
                  <ul className="space-y-3">
                    {weeklyTopEmotions.map((s) => (
                      <li key={`we-${s.key}`} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-slate-300 truncate" title={s.key}>
                          {prettyLabel(s.key)}
                        </span>
                        <span className="text-violet-300">
                          <Sparkline data={s.counts} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Themes + Emotions lists */}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recurring themes</h2>
                  {allThemes.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      {allThemes.length} distinct {allThemes.length === 1 ? "theme" : "themes"} (cleaned + merged)
                    </p>
                  )}
                </div>
                {allThemes.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllThemes((v) => !v)}
                    className="text-xs text-slate-600 hover:text-slate-400 transition"
                  >
                    {showAllThemes ? "Show less" : `+${allThemes.length - 6} more`}
                  </button>
                )}
              </div>

              {allThemes.length === 0 ? (
                <p className="text-sm text-slate-600">Not enough theme data yet — keep writing.</p>
              ) : (
                <ul className="space-y-4">
                  {visibleThemes.map(([k, v], i) => (
                    <BarRow key={`${k}-${i}`} label={k} count={v} max={maxTheme} rank={i} color="emerald" />
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Emotions over time</h2>
                  {allEmotions.length > 0 && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      {allEmotions.length} distinct {allEmotions.length === 1 ? "emotion" : "emotions"} (cleaned + merged)
                    </p>
                  )}
                </div>
                {allEmotions.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllEmotions((v) => !v)}
                    className="text-xs text-slate-600 hover:text-slate-400 transition"
                  >
                    {showAllEmotions ? "Show less" : `+${allEmotions.length - 6} more`}
                  </button>
                )}
              </div>

              {allEmotions.length === 0 ? (
                <p className="text-sm text-slate-600">Not enough emotion data yet — keep writing.</p>
              ) : (
                <ul className="space-y-4">
                  {visibleEmotions.map(([k, v], i) => (
                    <BarRow key={`${k}-${i}`} label={k} count={v} max={maxEmotion} rank={i} color="violet" />
                  ))}
                </ul>
              )}
            </section>
          </div>

          <p className="pb-2 text-center text-xs text-slate-700">Insights deepen as your reflection history grows.</p>
        </div>
      )}
    </div>
  );
}
