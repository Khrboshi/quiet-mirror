"use client";
// app/(protected)/insights/InsightsClient.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/app/components/I18nProvider";
import { DOMAIN_COLOR, QM } from "@/app/lib/colors";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightData = {
  themes: Record<string, number>;
  emotions: Record<string, number>;
  corepatterns?: Record<string, number>;
  entryCount?: number; // entries WITH reflections
  totalEntryCount?: number; // ALL entries
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
  domains?: Record<string, number>;
};

type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; text: string; generatedAt: string; cached: boolean }
  | { status: "error"; message: string };

function sortMap(m: Record<string, number>) {
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

// Sanitize raw AI Title Case output → sentence case
// "You're Caught Between X And Y" → "You're caught between x and y"
function toSentenceCase(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function maxVal(m: Record<string, number>) {
  const v = Object.values(m);
  return v.length ? Math.max(...v) : 1;
}

function friendlyDate(iso: string) {
  // Parse as UTC then format in local timezone to avoid month shifting
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({
  values,
  color = QM.dv.positive,
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
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const max = Math.max(...values, 1);
  const pad = 3;
  const step = (width - pad * 2) / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => ({
    x: pad + i * step,
    y: height - pad - (v / max) * (height - pad * 2),
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i - 1].x + points[i].x) / 2;
    const cp1y = points[i - 1].y;
    const cp2x = (points[i - 1].x + points[i].x) / 2;
    const cp2y = points[i].y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }

  const areaD =
    d +
    ` L ${points[points.length - 1].x} ${height}` +
    ` L ${points[0].x} ${height} Z`;

  const lastVal = values[values.length - 1];
  const prevVal = values[values.length - 2] ?? lastVal;
  const dotColor =
    lastVal > prevVal ? color : lastVal < prevVal ? "var(--qm-text-secondary)" : color;

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace("#", "")})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
  accent = QM.dv.positive,
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
            className="shrink-0 tabular-nums text-[10px] w-4 text-end"
            style={{ color: isTop ? accent : "var(--qm-text-muted)" }}
          >
            {rank + 1}
          </span>
          <span
            className={`truncate transition-colors ${
              isTop
                ? "font-medium text-qm-primary"
                : "text-qm-muted group-hover:text-qm-primary"
            }`}
            title={label}
          >
            {label}
          </span>
        </div>
        <span className="shrink-0 tabular-nums text-xs text-qm-faint">
          {count}
        </span>
      </div>
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: isTop ? accent : "var(--qm-bg-card)",
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
    <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">
        {label}
      </p>
      <p
        className="text-base font-semibold leading-tight"
        style={{ color: accent ?? "var(--qm-text-primary)" }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-qm-faint">{sub}</p>}
    </div>
  );
}

// ─── Trend pill ───────────────────────────────────────────────────────────────

function TrendPill({ label, dir }: { label: string; dir: "up" | "down" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        dir === "up"
          ? "border-qm-positive-border bg-qm-positive-soft text-qm-positive"
          : "border-qm-border-subtle bg-qm-card text-qm-faint"
      }`}
    >
      {dir === "up" ? "↑" : "↓"} {label}
    </span>
  );
}

// ─── Domain distribution ─────────────────────────────────────────────────────

function getDomainLabels(t: ReturnType<typeof useTranslation>["t"]): Record<
  string,
  { label: string; emoji: string; color: string }
> {
  return {
    MONEY:        { label: t.insightPreview.domainMoney,        emoji: "💰", color: DOMAIN_COLOR.MONEY },
    WORK:         { label: t.insightPreview.domainWork,         emoji: "💼", color: DOMAIN_COLOR.WORK },
    RELATIONSHIP: { label: t.insightPreview.domainRelationship, emoji: "🤝", color: DOMAIN_COLOR.RELATIONSHIP },
    HEALTH:       { label: t.insightPreview.domainHealth,       emoji: "🫀", color: DOMAIN_COLOR.HEALTH },
    GRIEF:        { label: t.insightPreview.domainGrief,        emoji: "🕊️", color: DOMAIN_COLOR.GRIEF },
    PARENTING:    { label: t.insightPreview.domainParenting,    emoji: "🌱", color: DOMAIN_COLOR.PARENTING },
    CREATIVE:     { label: t.insightPreview.domainCreative,     emoji: "✍️", color: DOMAIN_COLOR.CREATIVE },
    IDENTITY:     { label: t.insightPreview.domainIdentity,     emoji: "🪞", color: DOMAIN_COLOR.IDENTITY },
    FITNESS:      { label: t.insightPreview.domainFitness,      emoji: "⚡", color: DOMAIN_COLOR.FITNESS },
    GENERAL:      { label: "General", emoji: "📝", color: "var(--qm-text-muted)" },
  };
}

function DomainSection({
  domains,
  entryCount,
  t,
}: {
  domains: Record<string, number>;
  entryCount: number;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const DOMAIN_LABELS = getDomainLabels(t);
  const sorted = Object.entries(domains)
    .filter(([k]) => k !== "GENERAL")
    .sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  const total =
    entryCount > 0
      ? entryCount
      : Object.values(domains).reduce((s, v) => s + v, 0);
  const top = sorted[0]?.[0];
  const topMeta = DOMAIN_LABELS[top] ?? {
    label: top,
    emoji: "📝",
    color: QM.dv.positive,
  };

  const topCount = sorted[0]?.[1] ?? 0;
  const secondCount = sorted[1]?.[1] ?? 0;
  // Only highlight as "most written-about" if top domain has at least 2x entries of second
  // Otherwise it's a statistical tie and the label is misleading
  const hasClearLeader = topCount >= 2 && topCount >= secondCount * 2;

  return (
    <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
      <div className="mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
          {t.insights.domainSectionLabel}
        </h2>
        <p className="mt-0.5 text-xs text-qm-faint">
          {t.insights.domainSectionSub}
        </p>
      </div>

      <div className="my-4 flex items-center gap-3 rounded-xl border border-qm-border-subtle bg-qm-elevated px-4 py-3">
        <span className="text-2xl">{topMeta.emoji}</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: topMeta.color }}>
            {topMeta.label}
          </p>
          <p className="text-xs text-qm-faint">
            {t.insights.domainEntryOf(sorted[0][1], total)}
            {hasClearLeader ? ` ${t.insights.domainClearLeader}` : ` ${t.insights.domainPatternsClearer}`}
          </p>
        </div>
      </div>

      <ul className="space-y-3 mt-2">
        {sorted.map(([domain, count], i) => {
          const meta = DOMAIN_LABELS[domain] ?? {
            label: domain,
            emoji: "📝",
            color: "var(--qm-text-muted)",
          };
          const pct = Math.round((count / sorted[0][1]) * 100);
          return (
            <li key={domain} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-qm-secondary">
                  <span>{meta.emoji}</span>
                  <span className={i === 0 ? "font-medium" : "text-qm-muted"}>
                    {meta.label}
                  </span>
                </span>
                <span className="tabular-nums text-qm-faint">{count}</span>
              </div>
              <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: i === 0 ? meta.color : "var(--qm-bg-card)",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-2"
          >
            <div className="h-2 w-16 rounded bg-qm-card" />
            <div className="h-4 w-24 rounded bg-qm-card" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 space-y-3">
        <div className="h-3 w-16 rounded bg-qm-card" />
        <div className="h-5 w-2/3 rounded bg-qm-card" />
        <div className="h-3 w-1/2 rounded bg-qm-card" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6 space-y-5"
          >
            <div className="h-3 w-24 rounded bg-qm-card" />
            {[80, 60, 45, 35].map((w, j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div
                    className="h-3 rounded bg-qm-card"
                    style={{ width: `${w}%` }}
                  />
                  <div className="h-3 w-4 rounded bg-qm-card" />
                </div>
                <div className="h-[3px] w-full rounded-full bg-qm-card" />
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
  const { t } = useTranslation();
  const needed = Math.max(0, 5 - entryCount);
  return (
    <div className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-10 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-qm-border-subtle bg-qm-elevated text-2xl">
        ✦
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-qm-primary">
          {entryCount === 0
            ? t.ui.noReflectionsYet
            : t.ui.reflectionsSoFar(entryCount)}
        </h3>
        <p className="mx-auto max-w-sm text-sm text-qm-faint">
          {needed > 0
            ? t.ui.moreNeeded(needed)
            : t.ui.patternsGenerating}
        </p>
      </div>
      <Link
        href="/journal/new"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-qm-secondary hover:bg-white/10 transition"
      >
        {t.ui.writeAnEntry}
      </Link>
    </div>
  );
}

// ─── Weekly trends section ────────────────────────────────────────────────────

function WeeklyTrends({
  data,
  t,
}: {
  data: NonNullable<InsightData["weeklyTrend"]>;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const { weeks, themes: tSparklines, emotions: eSparklines } = data;

  const themeKeys = Object.keys(tSparklines);
  const emotionKeys = Object.keys(eSparklines);

  if (!themeKeys.length && !emotionKeys.length) return null;

  return (
    <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
            {t.insights.weeklyTrendsLabel}
          </h2>
          <p className="mt-0.5 text-xs text-qm-faint">
            {t.insights.weeklyTrendsSub}
          </p>
        </div>
        <span className="text-xs text-qm-faint">{t.insights.weeklyTrendsLast(weeks.length)}</span>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {themeKeys.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">
              {t.insights.weeklyTrendsThemes}
            </p>
            {themeKeys.map((k) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-qm-secondary min-w-0">
                  {k}
                </span>
                <Sparkline
                  values={tSparklines[k]}
                  color={QM.dv.positive}
                  width={80}
                  height={28}
                />
              </div>
            ))}
          </div>
        )}

        {emotionKeys.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">
              {t.insights.weeklyTrendsEmotions}
            </p>
            {emotionKeys.map((k) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-qm-secondary min-w-0">
                  {k}
                </span>
                <Sparkline
                  values={eSparklines[k]}
                  color={QM.dv.grief}
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

// ─── Weekly AI Summary ────────────────────────────────────────────────────────

function WeeklySummarySection({ hasRealData }: { hasRealData: boolean }) {
  const { t } = useTranslation();
  const [state, setState] = useState<SummaryState>({ status: "idle" });

  async function fetchSummary(force = false) {
    setState({ status: "loading" });
    try {
      if (force) {
        await fetch("/api/ai/weekly-summary", { method: "POST" });
      }
      const res = await fetch("/api/ai/weekly-summary", { cache: "no-store" });
      if (!res.ok) {
        const j: unknown = await res.json().catch(() => ({}));
        setState({
          status: "error",
          message: typeof (j as Record<string,unknown>).error === "string"
            ? (j as Record<string,unknown>).error as string
            : t.ui.summaryFailed,
        });
        return;
      }
      const j = await res.json();
      setState({
        status: "ready",
        text: j.summary,
        generatedAt: j.generatedAt,
        cached: j.cached,
      });
    } catch {
      setState({
        status: "error",
        message: t.errors.networkRetry,
      });
    }
  }

  useEffect(() => {
    if (hasRealData) fetchSummary();
  }, [hasRealData]);

  const generatedLabel = useMemo(() => {
    if (state.status !== "ready") return null;
    const d = new Date(state.generatedAt);
    // Use UTC date to prevent server timezone offset showing a different day
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }, [state]);

  return (
    <section className="rounded-2xl border border-qm-border-subtle bg-gradient-to-br from-qm-elevated to-qm-bg p-6 md:p-7">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
            What Quiet Mirror has noticed
          </h2>
          <p className="mt-0.5 text-xs text-qm-faint">
            A personal summary generated from your reflection history.
          </p>
        </div>

        {state.status === "ready" && (
          <button
            type="button"
            onClick={() => fetchSummary(true)}
            className="shrink-0 text-xs text-qm-faint hover:text-qm-muted transition"
            title={t.insights.regenerateSummary}
          >
            ↻ Refresh
          </button>
        )}
        {state.status === "loading" && (
          <span className="shrink-0 text-xs text-qm-faint animate-pulse">
            Generating…
          </span>
        )}
      </div>

      {state.status === "idle" && !hasRealData && (
        <p className="text-sm text-qm-faint">
          Generate a few more reflections and Quiet Mirror will write a personal
          summary of what it's noticed.
        </p>
      )}

      {state.status === "loading" && (
        <div className="space-y-2.5 animate-pulse">
          <div className="h-3.5 w-full rounded bg-qm-card" />
          <div className="h-3.5 w-5/6 rounded bg-qm-card" />
          <div className="h-3.5 w-4/5 rounded bg-qm-card" />
          <div className="mt-2 h-3.5 w-full rounded bg-qm-card" />
          <div className="h-3.5 w-3/4 rounded bg-qm-card" />
        </div>
      )}

      {state.status === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-qm-faint">{state.message}</p>
          <button
            type="button"
            onClick={() => fetchSummary()}
            className="text-xs font-medium text-qm-positive hover:text-qm-positive-hover transition"
          >
            Try again →
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <div className="space-y-4">
          {state.text
            .split(/\n\n+/)
            .filter(Boolean)
            .map((para, i) => (
              <p
                key={i}
                className={`leading-relaxed ${
                  i === 0 ? "text-base text-qm-primary" : "text-sm text-qm-muted"
                }`}
              >
                {para}
              </p>
            ))}

          <div className="flex items-center gap-3 pt-1 border-t border-qm-border-subtle">
            <span className="text-xs text-qm-faint" suppressHydrationWarning>
              Last updated {generatedLabel}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

export default function InsightsClient() {
  const { t } = useTranslation();
  const [data, setData] = useState<InsightData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllEmotions, setShowAllEmotions] = useState(false);

  useEffect(() => {
    async function load() {
      setError(null);
      try {
        const res = await fetch("/api/ai/insights", { cache: "no-store" });
        if (!res.ok) {
          const j: unknown = await res.json().catch(() => ({}));
          setError(
            typeof (j as Record<string,unknown>).error === "string"
              ? (j as Record<string,unknown>).error as string
              : t.errors.insightsFailed
          );
          return;
        }
        setData(await res.json());
      } catch {
        setError(t.errors.insightsFailed);
      }
    }
    load();
  }, []);

  const allThemes = useMemo(() => (data ? sortMap(data.themes) : []), [data]);
  const allEmotions = useMemo(
    () => (data ? sortMap(data.emotions) : []),
    [data]
  );
  const topCorepatterns = useMemo(
    () => (data?.corepatterns ? sortMap(data.corepatterns).slice(0, 5) : []),
    [data]
  );
  const hasDomains = useMemo(
    () =>
      !!data?.domains &&
      Object.keys(data.domains).filter((k) => k !== "GENERAL").length > 0,
    [data]
  );

  const visibleThemes = showAllThemes ? allThemes : allThemes.slice(0, 6);
  const visibleEmotions = showAllEmotions
    ? allEmotions
    : allEmotions.slice(0, 6);

  const maxTheme = useMemo(() => (data ? maxVal(data.themes) : 1), [data]);
  const maxEmotion = useMemo(() => (data ? maxVal(data.emotions) : 1), [data]);
  const maxPattern = useMemo(
    () => (data?.corepatterns ? maxVal(data.corepatterns) : 1),
    [data]
  );

  const topEmotion = allEmotions[0]?.[0];
  const topTheme = allThemes[0]?.[0];
  const entryCount = data?.entryCount ?? 0;
  const totalEntryCount = data?.totalEntryCount ?? entryCount;
  const hasRealData = data?.hasRealData ?? false;
  const hasTrend =
    (data?.trend?.up?.length ?? 0) + (data?.trend?.down?.length ?? 0) > 0;
  const hasWeeklyData =
    (data?.weeklyTrend?.weeks?.length ?? 0) >= 2 &&
    (Object.keys(data?.weeklyTrend?.themes ?? {}).length > 0 ||
      Object.keys(data?.weeklyTrend?.emotions ?? {}).length > 0);

  const momentumColor: Record<string, string> = {
    Lifting: QM.dv.positive,
    Shifting: QM.dv.creative,
    Softening: "var(--qm-text-secondary)",
    Heavy: QM.dv.fear,
    Steady: "var(--qm-text-muted)",
  };
  const mColor = momentumColor[data?.momentum ?? "Steady"] ?? "var(--qm-text-muted)";

  function renderHeadline() {
    if (!topEmotion && !topTheme) return null;
    if (topEmotion && topTheme) {
      return (
        <>
          <span className="text-qm-primary font-semibold">{topEmotion}</span>{" "}
          keeps showing up — often alongside{" "}
          <span className="text-qm-primary font-semibold">{topTheme}</span>.
        </>
      );
    }
    if (topEmotion) {
      return (
        <>
          <span className="text-qm-primary font-semibold">{topEmotion}</span> is
          the emotion that appears most across your reflections.
        </>
      );
    }
    return (
      <>
        <span className="text-qm-primary font-semibold">{topTheme}</span> is a
        theme that keeps appearing across your entries.
      </>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 pb-10 sm:px-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-qm-primary sm:text-4xl">{t.insights.pageHeading}</h1>
        <p className="mt-1 text-sm text-qm-faint">
          {t.insights.pageSubheading}
          {totalEntryCount > 0 && (
            <>
              {" "}
              —{" "}
              <span className="text-qm-muted">
                {totalEntryCount} {totalEntryCount === 1 ? t.dashboard.entry : t.dashboard.entries}
              </span>
            </>
          )}
          {entryCount > 0 && entryCount < totalEntryCount && (
            <span className="text-qm-faint"> · {entryCount} reflected</span>
          )}
          {data?.firstEntryDate && data?.lastEntryDate && mounted && (() => {
            const first = friendlyDate(data.firstEntryDate!);
            const last = friendlyDate(data.lastEntryDate!);
            return (
              <span className="text-qm-faint" suppressHydrationWarning>
                {" · "}
                {first === last ? first : `${first} – ${last}`}
              </span>
            );
          })()}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-qm-danger-border bg-qm-danger-bg p-4 text-sm text-qm-danger">
          {error}
        </div>
      )}

      {!error && !data && <Skeleton />}

      {data && !hasRealData && <NotEnoughData entryCount={entryCount} />}

      {data && hasRealData && (
        <div className="space-y-6">
          <div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            suppressHydrationWarning
          >
            <StatCard
              label={t.insights.entries}
              value={String(totalEntryCount)}
              sub={
                data.firstEntryDate && mounted
                  ? `Since ${friendlyDate(data.firstEntryDate)}`
                  : data.firstEntryDate
                  ? t.insights.sinceJoined
                  : undefined
              }
            />
            <StatCard
              label={t.insights.topEmotion}
              value={topEmotion ?? "—"}
              sub={allEmotions[0] ? `${allEmotions[0][1]} ${allEmotions[0][1] === 1 ? "time" : "times"}` : undefined}
              accent={QM.dv.grief}
            />
            <StatCard
              label={t.insights.topTheme}
              value={topTheme ?? "—"}
              sub={allThemes[0] ? `${allThemes[0][1]} entries` : undefined}
              accent={QM.dv.positive}
            />
            <StatCard
              label={t.insights.momentum}
              value={data.momentum ?? t.insights.momentumDefault}
              sub={(() => {
                const m = data.momentum ?? "Steady";
                return t.insights.momentumDescriptions[m] ?? t.insights.momentumDescriptions["Steady"];
              })()}
              accent={mColor}
            />
          </div>

          {/* ── Weekly AI summary ── */}
          <WeeklySummarySection hasRealData={hasRealData} />

          {/* Premium teaser intentionally removed — /insights is only reachable
              by Premium/Trial users (page.tsx redirects free users to /insights/preview).
              Showing a "See Premium" CTA to paying customers is actively harmful. */}

          {/* ── Domain distribution ── */}
          {hasDomains && (
            <DomainSection domains={data.domains!} entryCount={entryCount} t={t} />
          )}

          <section className="rounded-2xl border border-qm-border-subtle bg-gradient-to-br from-qm-bg to-qm-elevated p-7">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-qm-faint">
              The pattern underneath
            </p>

            <p
              className="text-lg leading-relaxed text-qm-secondary"
              suppressHydrationWarning
            >
              {renderHeadline()}
            </p>

            {hasTrend && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-qm-faint me-0.5">{t.insights.recentlyLabel}</span>
                {data.trend?.up?.map((e) => (
                  <TrendPill key={`u-${e}`} label={e} dir="up" />
                ))}
                {data.trend?.down?.map((e) => (
                  <TrendPill key={`d-${e}`} label={e} dir="down" />
                ))}
              </div>
            )}

            <p className="mt-4 text-xs text-qm-faint">
              {t.insights.patternsNote}
            </p>
          </section>

          {topCorepatterns.length > 0 && (
            <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
                What you keep coming back to
              </h2>
              <p className="mt-0.5 mb-5 text-xs text-qm-faint">
                The specific dynamic Quiet Mirror noticed most often beneath your
                entries.
              </p>

              <div className="mb-4 rounded-xl border border-qm-positive-border bg-qm-positive-bg p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-relaxed text-qm-primary">
                    <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-qm-positive align-middle" />
                    {toSentenceCase(topCorepatterns[0][0])}
                  </p>
                  <span className="shrink-0 rounded-full bg-qm-positive-soft px-2 py-0.5 text-xs tabular-nums text-qm-positive">
                    {topCorepatterns[0][1]}× across {entryCount} {entryCount === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-qm-faint ps-4">
                  Your most recurring underlying pattern
                </p>
              </div>

              {topCorepatterns.length > 1 && (
                <ul className="space-y-3">
                  {topCorepatterns.slice(1).map(([pattern, count]) => (
                    <li key={pattern} className="group space-y-1.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs leading-relaxed text-qm-muted group-hover:text-qm-secondary transition-colors">
                          {toSentenceCase(pattern)}
                        </p>
                        <span className="shrink-0 tabular-nums text-xs text-qm-faint pt-0.5">
                          {count}×
                        </span>
                      </div>
                      <div className="h-[2px] w-full overflow-hidden rounded-full bg-qm-card">
                        <div
                          className="h-full rounded-full bg-qm-soft transition-all duration-700"
                          style={{
                            width: `${Math.round((count / maxPattern) * 100)}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {hasWeeklyData && <WeeklyTrends data={data.weeklyTrend!} t={t} />}

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
                    {t.insights.recurringThemesLabel}
                  </h2>
                  <p className="mt-0.5 text-xs text-qm-faint">
                    {t.insights.recurringThemesSub(allThemes.length)}
                  </p>
                </div>
                {allThemes.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllThemes((v) => !v)}
                    className="text-xs text-qm-positive hover:text-qm-positive-hover transition font-medium"
                  >
                    {showAllThemes ? t.insights.showLess : t.insights.showMore(allThemes.length - 6)}
                  </button>
                )}
              </div>

              {allThemes.length === 0 ? (
                <p className="text-sm text-qm-faint">
                  {t.insights.notEnoughThemes}
                </p>
              ) : (
                <ul className="space-y-4">
                  {visibleThemes.map(([k, v], i) => (
                    <BarRow
                      key={k}
                      label={k}
                      count={v}
                      max={maxTheme}
                      rank={i}
                      accent={QM.dv.positive}
                    />
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">
                    {t.insights.whatKeepsSurfacingLabel}
                  </h2>
                  <p className="mt-0.5 text-xs text-qm-faint">
                    {t.insights.whatKeepsSurfacingSub(allEmotions.length)}
                  </p>
                </div>
                {allEmotions.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setShowAllEmotions((v) => !v)}
                    className="text-xs text-qm-positive hover:text-qm-positive-hover transition font-medium"
                  >
                    {showAllEmotions
                      ? t.insights.showLess
                      : t.insights.showMore(allEmotions.length - 6)}
                  </button>
                )}
              </div>

              {allEmotions.length === 0 ? (
                <p className="text-sm text-qm-faint">
                  {t.insights.notEnoughEmotions}
                </p>
              ) : (
                <ul className="space-y-4">
                  {visibleEmotions.map(([k, v], i) => (
                    <BarRow
                      key={k}
                      label={k}
                      count={v}
                      max={maxEmotion}
                      rank={i}
                      accent={QM.dv.grief}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>

          {topCorepatterns.length > 0 && (
            <section className="rounded-2xl border border-qm-border-subtle bg-qm-positive-bg p-6 text-center">
              <p className="text-sm font-medium text-qm-primary">
                The pattern is clearer now.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-qm-muted">
                The next entry is where you take it further.
              </p>
              <Link
                href={`/journal/new?prompt=${encodeURIComponent(
                  `I keep noticing ${topCorepatterns[0][0].toLowerCase()}. What's underneath it today?`
                )}`}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-qm-accent px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-qm-accent-hover"
              >
                Write about this →
              </Link>
              <p className="mt-3 text-xs text-qm-faint">
                Insights deepen as your reflection history grows.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
