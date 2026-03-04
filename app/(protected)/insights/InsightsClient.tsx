// app/(protected)/insights/InsightsClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightData = {
  themes: Record<string, number>;
  emotions: Record<string, number>;
  corepatterns?: Record<string, number>;
  entryCount?: number;
  hasRealData?: boolean;
  firstEntryDate?: string | null;
  lastEntryDate?: string | null;
  weeklyTrend?: {
    weeks: string[];
    themes: Record<string, number[]>;
    emotions: Record<string, number[]>;
  };
  trend?: { up: string[]; down: string[] };
  momentum?: string;
};

function sortMap(m: Record<string, number>) {
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function maxVal(m: Record<string, number>) {
  const v = Object.values(m);
  return v.length ? Math.max(...v) : 1;
}
function friendlyDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({
  values,
  color = "#34d399",
  height = 32,
  width = 80,
}: {
  values: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!values.length || values.every((v) => v === 0)) {
    return (
      <svg width={width} height={height} className="opacity-20">
        <line
          x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke={color} strokeWidth={1.5} strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const max = Math.max(...values, 1);
  const pad = 3;
  const step = (width - pad * 2) / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: height - pad - ((v / max) * (height - pad * 2)),
  }));

  // Smooth curve via bezier
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2;
    const cp1y = points[i - 1].y;
    const cp2x = (points[i - 1].x + points[i].x) / 2;
    const cp2y = points[i].y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }

  // Area fill path
  const areaD =
    d +
    ` L ${points[points.length - 1].x} ${height}` +
    ` L ${points[0].x} ${height} Z`;

  const lastVal = values[values.length - 1];
  const prevVal = values[values.length - 2] ?? lastVal;
  const dotColor = lastVal > prevVal ? color : lastVal < prevVal ? "#94a3b8" : color;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={dotColor}
      />
    </svg>
  );
}

// ─── Bar row ──────────────────────────────────────────────────────────────────

function BarRow({
  label,
  count,
  max,
  rank,
  accent = "#34d399",
}: {
  label: string;
  count: number;
  max: number;
  rank: number;
  accent?: string;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const isTop = rank === 0;

  return (
    <li className="group space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="shrink-0 tabular-nums text-[10px] w-4 text-right"
            style={{ color: isTop ? accent : "#475569" }}
          >
            {rank + 1}
          </span>
          <span
            className={`truncate transition-colors ${
              isTop
                ? "font-medium text-slate-100"
                : "text-slate-400 group-hover:text-slate-200"
            }`}
            title={label}
          >
            {label}
          </span>
        </div>
        <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: isTop ? accent : "#334155",
          }}
        />
      </div>
    </li>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
      <p
        className="text-base font-semibold leading-tight"
        style={{ color: accent ?? "#e2e8f0" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  );
}

// ─── Trend pill ───────────────────────────────────────────────────────────────

function TrendPill({ label, dir }: { label: string; dir: "up" | "down" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        dir === "up"
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-800/60 text-slate-500"
      }`}
    >
      {dir === "up" ? "↑" : "↓"} {label}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
            <div className="h-2 w-16 rounded bg-slate-800" />
            <div className="h-4 w-24 rounded bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-3">
        <div className="h-3 w-16 rounded bg-slate-800" />
        <div className="h-5 w-2/3 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 space-y-5">
            <div className="h-3 w-24 rounded bg-slate-800" />
            {[80, 60, 45, 35].map((w, j) => (
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

// ─── Not enough data ──────────────────────────────────────────────────────────

function NotEnoughData({ entryCount }: { entryCount: number }) {
  const needed = Math.max(0, 5 - entryCount);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-10 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-2xl">
        ✦
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-slate-200">
          {entryCount === 0 ? "No reflections yet" : `${entryCount} ${entryCount === 1 ? "reflection" : "reflections"} so far`}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-slate-500">
          {needed > 0
            ? `${needed} more ${needed === 1 ? "reflection" : "reflections"} and Havenly will start surfacing what quietly repeats across your entries.`
            : "Generating your personal patterns now — check back after your next reflection."}
        </p>
      </div>
      <Link
        href="/journal/new"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-slate-300 hover:bg-white/10 transition"
      >
        Write an entry →
      </Link>
    </div>
  );
}

// ─── Weekly trends section ────────────────────────────────────────────────────

function WeeklyTrends({
  data,
}: {
  data: NonNullable<InsightData["weeklyTrend"]>;
}) {
  const { weeks, themes: tSparklines, emotions: eSparklines } = data;

  const themeKeys = Object.keys(tSparklines);
  const emotionKeys = Object.keys(eSparklines);

  if (!themeKeys.length && !emotionKeys.length) return null;

  // Format week label: "YYYY-WW" → "W12" or "Apr"
  const weekLabels = weeks.map((w) => {
    const [, wn] = w.split("-");
    return `W${parseInt(wn, 10)}`;
  });

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Weekly trends
          </h2>
          <p className="mt-0.5 text-xs text-slate-600">
            How your top patterns have moved week‑to‑week.
          </p>
        </div>
        <span className="text-xs text-slate-700">Last {weeks.length} weeks</span>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {/* Themes */}
        {themeKeys.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Themes
            </p>
            {themeKeys.map((k) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-slate-300 min-w-0">{k}</span>
                <Sparkline
                  values={tSparklines[k]}
                  color="#34d399"
                  width={80}
                  height={28}
                />
              </div>
            ))}
          </div>
        )}

        {/* Emotions */}
        {emotionKeys.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Emotions
            </p>
            {emotionKeys.map((k) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-slate-300 min-w-0">{k}</span>
                <Sparkline
                  values={eSparklines[k]}
                  color="#a78bfa"
                  width={80}
                  height={28}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

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
          return;
        }
        setData(await res.json());
      } catch {
        setError("Failed to load insights.");
      }
    }
    load();
  }, []);

  const allThemes = useMemo(() => (data ? sortMap(data.themes) : []), [data]);
  const allEmotions = useMemo(() => (data ? sortMap(data.emotions) : []), [data]);
  const topCorepatterns = useMemo(
    () => (data?.corepatterns ? sortMap(data.corepatterns).slice(0, 5) : []),
    [data]
  );

  const visibleThemes = showAllThemes ? allThemes : allThemes.slice(0, 6);
  const visibleEmotions = showAllEmotions ? allEmotions : allEmotions.slice(0, 6);

  const maxTheme = useMemo(() => (data ? maxVal(data.themes) : 1), [data]);
  const maxEmotion = useMemo(() => (data ? maxVal(data.emotions) : 1), [data]);
  const maxPattern = useMemo(
    () => (data?.corepatterns ? maxVal(data.corepatterns) : 1),
    [data]
  );

  const topEmotion = allEmotions[0]?.[0];
  const topTheme = allThemes[0]?.[0];
  const entryCount = data?.entryCount ?? 0;
  const hasRealData = data?.hasRealData ?? false;
  const hasTrend =
    (data?.trend?.up?.length ?? 0) + (data?.trend?.down?.length ?? 0) > 0;
  const hasWeeklyData =
    (data?.weeklyTrend?.weeks?.length ?? 0) >= 2 &&
    (Object.keys(data?.weeklyTrend?.themes ?? {}).length > 0 ||
      Object.keys(data?.weeklyTrend?.emotions ?? {}).length > 0);

  // Momentum colour
  const momentumColor: Record<string, string> = {
    Lifting: "#34d399",
    Shifting: "#fbbf24",
    Softening: "#94a3b8",
    Heavy: "#f87171",
    Steady: "#64748b",
  };
  const mColor = momentumColor[data?.momentum ?? "Steady"] ?? "#64748b";

  // Personal headline
  const headline = useMemo(() => {
    if (!topEmotion && !topTheme) return null;
    if (topEmotion && topTheme) {
      return (
        <>
          <span className="text-slate-100 font-semibold">{topEmotion}</span>{" "}
          keeps showing up — often alongside{" "}
          <span className="text-slate-100 font-semibold">{topTheme}</span>.
        </>
      );
    }
    if (topEmotion) {
      return (
        <>
          <span className="text-slate-100 font-semibold">{topEmotion}</span> is
          the emotion that appears most across your reflections.
        </>
      );
    }
    return (
      <>
        <span className="text-slate-100 font-semibold">{topTheme}</span> is a
        theme that keeps appearing across your entries.
      </>
    );
  }, [topEmotion, topTheme]);

  return (
    <div className="space-y-8 pb-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          What Havenly has noticed across your reflections
          {entryCount > 0 && (
            <> — <span className="text-slate-400">{entryCount} {entryCount === 1 ? "entry" : "entries"}</span></>
          )}
          {data?.firstEntryDate && data?.lastEntryDate && (
            <span className="text-slate-600">
              {" "}· {friendlyDate(data.firstEntryDate)} – {friendlyDate(data.lastEntryDate)}
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {!error && !data && <Skeleton />}

      {/* Not enough data */}
      {data && !hasRealData && <NotEnoughData entryCount={entryCount} />}

      {/* Real content */}
      {data && hasRealData && (
        <div className="space-y-6">

          {/* ── Stat bar ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Entries"
              value={String(entryCount)}
              sub={data.firstEntryDate ? `Since ${friendlyDate(data.firstEntryDate)}` : undefined}
            />
            <StatCard
              label="Top emotion"
              value={topEmotion ?? "—"}
              sub={allEmotions[0] ? `${allEmotions[0][1]} times` : undefined}
              accent="#a78bfa"
            />
            <StatCard
              label="Top theme"
              value={topTheme ?? "—"}
              sub={allThemes[0] ? `${allThemes[0][1]} entries` : undefined}
              accent="#34d399"
            />
            <StatCard
              label="Momentum"
              value={data.momentum ?? "Steady"}
              sub="Last 4 weeks"
              accent={mColor}
            />
          </div>

          {/* ── Narrative headline ── */}
          <section className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900/40 p-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              What this shows
            </p>

            <p className="text-lg leading-relaxed text-slate-300">{headline}</p>

            {hasTrend && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-600 mr-0.5">Recently:</span>
                {data.trend?.up?.map((e) => (
                  <TrendPill key={`u-${e}`} label={e} dir="up" />
                ))}
                {data.trend?.down?.map((e) => (
                  <TrendPill key={`d-${e}`} label={e} dir="down" />
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-slate-600">
              These are patterns, not diagnoses. They shift as you keep writing.
            </p>
          </section>

          {/* ── What you keep coming back to (corepatterns) ── */}
          {topCorepatterns.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                What you keep coming back to
              </h2>
              <p className="mt-0.5 mb-5 text-xs text-slate-600">
                The specific dynamic Havenly noticed most often beneath your entries.
              </p>

              <ul className="space-y-5">
                {topCorepatterns.map(([pattern, count], i) => (
                  <li key={pattern} className="group space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={`text-sm leading-relaxed ${
                          i === 0
                            ? "font-medium text-slate-100"
                            : "text-slate-400 group-hover:text-slate-300 transition-colors"
                        }`}
                      >
                        {i === 0 && (
                          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
                        )}
                        {pattern}
                      </p>
                      <span className="shrink-0 tabular-nums text-xs text-slate-700 pt-0.5">
                        {count}×
                      </span>
                    </div>
                    <div className="h-[2px] w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.round((count / maxPattern) * 100)}%`,
                          backgroundColor: i === 0 ? "rgba(52,211,153,0.5)" : "#1e293b",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Weekly sparklines ── */}
          {hasWeeklyData && <WeeklyTrends data={data.weeklyTrend!} />}

          {/* ── Themes + Emotions grid ── */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Themes */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Recurring themes
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {allThemes.length} distinct {allThemes.length === 1 ? "theme" : "themes"} · cleaned + merged
                  </p>
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
                <p className="text-sm text-slate-600">
                  Not enough personal theme data yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {visibleThemes.map(([k, v], i) => (
                    <BarRow
                      key={k} label={k} count={v}
                      max={maxTheme} rank={i} accent="#34d399"
                    />
                  ))}
                </ul>
              )}
            </section>

            {/* Emotions */}
            <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Emotions over time
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {allEmotions.length} distinct {allEmotions.length === 1 ? "emotion" : "emotions"} · cleaned + merged
                  </p>
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
                <p className="text-sm text-slate-600">
                  Not enough personal emotion data yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {visibleEmotions.map(([k, v], i) => (
                    <BarRow
                      key={k} label={k} count={v}
                      max={maxEmotion} rank={i} accent="#a78bfa"
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ── Footer ── */}
          <p className="text-center text-xs text-slate-700">
            Insights deepen as your reflection history grows.
          </p>

        </div>
      )}
    </div>
  );
}
