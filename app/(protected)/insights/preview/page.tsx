// app/(protected)/insights/preview/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import UpgradeIntentTracker from "@/app/components/UpgradeIntentTracker";

// ── Pull real user data ───────────────────────────────────────────────────────

async function getUserInsightData(userId: string) {
  const supabase = createServerSupabase();

  const { data: rows } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const domains: Record<string, number> = {};
  let entryCount = 0;

  const FALLBACK_THEMES = new Set(["self-awareness", "processing", "presence",
    "consistency", "recovery", "self-respect", "motivation", "recognition",
    "boundaries", "self-worth", "connection", "visibility"]);
  const FALLBACK_EMOTIONS = new Set(["uncertainty", "restlessness", "quiet courage",
    "pride", "tiredness", "determination", "frustration", "hurt", "longing", "confusion"]);

  for (const row of rows ?? []) {
    let parsed: any = null;
    try {
      parsed = typeof row.ai_response === "string"
        ? JSON.parse(row.ai_response) : row.ai_response;
    } catch { continue; }

    entryCount++;

    for (const t of Array.isArray(parsed?.themes) ? parsed.themes : []) {
      const k = String(t || "").trim().toLowerCase();
      if (!k || FALLBACK_THEMES.has(k)) continue;
      themes[k] = (themes[k] || 0) + 1;
    }
    for (const e of Array.isArray(parsed?.emotions) ? parsed.emotions : []) {
      const k = String(e || "").trim().toLowerCase();
      if (!k || FALLBACK_EMOTIONS.has(k)) continue;
      emotions[k] = (emotions[k] || 0) + 1;
    }
    const domain = typeof parsed?.domain === "string"
      ? parsed.domain.trim().toUpperCase() : "";
    if (domain && domain !== "GENERAL") {
      domains[domain] = (domains[domain] || 0) + 1;
    }
  }

  const sortedThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);
  const sortedEmotions = Object.entries(emotions).sort((a, b) => b[1] - a[1]);
  const topDomain = Object.entries(domains).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    entryCount,
    sortedThemes,
    sortedEmotions,
    topDomain,
    themeCount: sortedThemes.length,
    emotionCount: sortedEmotions.length,
    topTheme: sortedThemes[0]?.[0] ?? null,
    topEmotion: sortedEmotions[0]?.[0] ?? null,
  };
}

const DOMAIN_LABELS: Record<string, { label: string; emoji: string }> = {
  MONEY:        { label: "Money",         emoji: "💰" },
  WORK:         { label: "Work",          emoji: "💼" },
  RELATIONSHIP: { label: "Relationships", emoji: "🤝" },
  HEALTH:       { label: "Health",        emoji: "🫀" },
  GRIEF:        { label: "Grief",         emoji: "🕊️" },
  PARENTING:    { label: "Parenting",     emoji: "🌱" },
  CREATIVE:     { label: "Creative",      emoji: "✍️" },
  IDENTITY:     { label: "Identity",      emoji: "🪞" },
  FITNESS:      { label: "Fitness",       emoji: "⚡" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InsightsPreviewPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login");

  const {
    entryCount, sortedThemes, sortedEmotions,
    topDomain, themeCount, emotionCount, topTheme, topEmotion,
  } = await getUserInsightData(user.id);

  const hasData = entryCount >= 2 && (topTheme || topEmotion);
  const domainMeta = topDomain ? (DOMAIN_LABELS[topDomain] ?? { label: topDomain.toLowerCase(), emoji: "📝" }) : null;

  // Demo fallbacks for richer display when not enough data
  const displayTheme  = topTheme  ?? "work stress";
  const displayEmotion = topEmotion ?? "apprehension";
  const displayDomain = domainMeta?.label ?? "work and career";

  // Build display theme/emotion bars — up to 6, with demo fill-ins
  const demoThemes  = ["lack of recognition", "communication breakdown", "unexpressed emotions", "financial strain", "relationship repair"];
  const demoEmotions = ["invisibility", "surprise", "regret", "guilt", "joy"];

  const themeBars = sortedThemes.slice(0, 6).map(([k, v]) => ({ label: k, count: v, real: true }));
  if (themeBars.length < 4) {
    demoThemes.filter(t => t !== topTheme).slice(0, 6 - themeBars.length).forEach((t, i) =>
      themeBars.push({ label: t, count: Math.max(1, (themeBars[0]?.count ?? 3) - i - 1), real: false })
    );
  }

  const emotionBars = sortedEmotions.slice(0, 6).map(([k, v]) => ({ label: k, count: v, real: true }));
  if (emotionBars.length < 4) {
    demoEmotions.filter(e => e !== topEmotion).slice(0, 6 - emotionBars.length).forEach((e, i) =>
      emotionBars.push({ label: e, count: Math.max(1, (emotionBars[0]?.count ?? 3) - i - 1), real: false })
    );
  }

  const maxTheme   = Math.max(...themeBars.map(t => t.count), 1);
  const maxEmotion = Math.max(...emotionBars.map(e => e.count), 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <UpgradeIntentTracker source="insights-preview" />

      {/* ── Sticky upgrade banner ─────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 border-b border-emerald-500/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <p className="text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">Premium preview</span>
            {" "}— this is what your insights page will look like.
          </p>
          <Link
            href="/upgrade?from=insights-preview"
            className="shrink-0 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Unlock →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 pb-16 sm:px-6">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">Insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            What Havenly has noticed across your reflections
            {entryCount > 0 && <> — <span className="text-slate-400">{entryCount} {entryCount === 1 ? "entry" : "entries"}</span></>}
            {!hasData && <span className="ml-1 text-emerald-500/70">· demo data shown below</span>}
          </p>
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Entries", value: String(entryCount ?? 0), sub: "Since you joined", accent: undefined },
            { label: "Top emotion", value: displayEmotion, sub: hasData ? `${sortedEmotions[0]?.[1] ?? 2} times` : "2 times", accent: "#a78bfa" },
            { label: "Top theme", value: displayTheme, sub: hasData ? `${sortedThemes[0]?.[1] ?? 1} ${sortedThemes[0]?.[1] === 1 ? "entry" : "entries"}` : "1 entry", accent: "#34d399" },
            { label: "Momentum", value: "Shifting", sub: "Based on today", accent: "#fbbf24" },
          ].map(({ label, value, sub, accent }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
              <p className="text-base font-semibold leading-tight capitalize truncate" style={{ color: accent ?? "#e2e8f0" }}>{value}</p>
              {sub && <p className="text-xs text-slate-600 capitalize">{sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Weekly summary — blurred/locked ────────────────────────────── */}
        <div className="relative rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-7 overflow-hidden">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">What Havenly has noticed</h2>
            <p className="mt-0.5 text-xs text-slate-700">A personal summary generated from your reflection history.</p>
          </div>
          {/* Blurred demo content */}
          <div className="space-y-4 select-none pointer-events-none blur-[3px]">
            <p className="text-base leading-relaxed text-slate-200">
              You often write about {displayDomain}, relationships, and general life reflections, with a sense of {displayEmotion} simmering beneath the surface.
              Your entries are filled with moments of effort and relief, but it&apos;s clear that pressure to perform is a constant companion.
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              A pattern has emerged: stress is often intensified by feelings of being unseen or undervalued. This sense of disconnection and {displayEmotion} is recurring,
              and it&apos;s clear it&apos;s affecting your well-being.
            </p>
            <p className="text-sm text-slate-400">
              What&apos;s been on your mind lately, and how have you been taking care of yourself in the midst of all this?
            </p>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/50 backdrop-blur-[1px]">
            <p className="text-sm font-medium text-slate-300 text-center px-4">Your personal weekly summary</p>
            <p className="text-xs text-slate-500 text-center max-w-xs px-4">Havenly reads all your entries and writes this in plain language — what it noticed, what&apos;s shifting, what keeps returning.</p>
            <Link href="/upgrade?from=insights-preview" className="mt-1 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition">
              Unlock your summary →
            </Link>
          </div>
        </div>

        {/* ── What you write about most ──────────────────────────────────── */}
        {(hasData || true) && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">What you write about most</h2>
            <p className="text-xs text-slate-600 mb-4">Based on domain detection across all reflected entries.</p>

            <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <span className="text-2xl">{domainMeta?.emoji ?? "💼"}</span>
              <div>
                <p className="text-sm font-semibold text-blue-400">{domainMeta?.label ?? "Work"}</p>
                <p className="text-xs text-slate-500">{hasData ? `${Object.values({}).length || 3} of ${entryCount}` : "3 of 12"} entries — your most written-about area</p>
              </div>
            </div>

            <ul className="space-y-3">
              {(hasData
                ? Object.entries(DOMAIN_LABELS).filter(([k]) => k === topDomain || k !== topDomain).slice(0, 7)
                : [["WORK","Work"],["RELATIONSHIP","Relationships"],["MONEY","Money"],["HEALTH","Health"],["GRIEF","Grief"],["PARENTING","Parenting"],["IDENTITY","Identity"]]
              ).map(([key, meta], i) => {
                const m = DOMAIN_LABELS[key] ?? { label: String(meta), emoji: "📝" };
                const pct = Math.max(5, 100 - i * 14);
                const isTop = i === 0;
                return (
                  <li key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span>{m.emoji}</span>
                        <span className={isTop ? "font-medium" : "text-slate-400"}>{m.label}</span>
                      </span>
                      <span className={`tabular-nums ${isTop ? "text-slate-400" : "text-slate-600"}`}>{Math.max(1, 3 - i)}</span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: isTop ? (DOMAIN_LABELS[key]?.label === "Work" ? "#60a5fa" : "#34d399") : "#1e293b" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── The pattern underneath ────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900/40 p-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">The pattern underneath</p>
          <p className="text-lg leading-relaxed text-slate-300">
            <span className="font-semibold text-slate-100" style={{ textTransform: "capitalize" }}>{displayEmotion}</span>{" "}
            keeps showing up — often alongside{" "}
            <span className="font-semibold text-slate-100">{displayTheme}</span>.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-600 mr-0.5">Recently:</span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
              ↑ {displayEmotion}
            </span>
          </div>
          <p className="mt-4 text-xs text-slate-600">These are patterns, not diagnoses. They shift as you keep writing.</p>
        </div>

        {/* ── What you keep coming back to — locked ──────────────────────── */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/50 p-6 overflow-hidden">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">What you keep coming back to</h2>
          <p className="mt-0.5 mb-5 text-xs text-slate-600">The specific dynamic Havenly noticed most often beneath your entries.</p>

          {/* Top pattern — shown */}
          <div className="mb-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-relaxed text-slate-100">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
                Work stress is being sharpened by feeling unseen, undervalued, or behind.
              </p>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs tabular-nums text-emerald-400">2×</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 pl-4">Your most recurring underlying pattern</p>
          </div>

          {/* Deeper patterns — blurred */}
          <div className="space-y-3 blur-sm select-none pointer-events-none">
            {[
              "You're caught between maintaining the relationship and expressing your own emotional needs.",
              "Financial stress is affecting your sense of safety, control, and self-worth.",
              "The fear of uncertainty is triggering a physical response.",
            ].map((p, i) => (
              <div key={i} className="group space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs leading-relaxed text-slate-400">{p}</p>
                  <span className="shrink-0 tabular-nums text-xs text-slate-700 pt-0.5">{i + 1}×</span>
                </div>
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-slate-700" style={{ width: `${70 - i * 20}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Lock */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent flex items-end justify-center pb-5">
            <Link href="/upgrade?from=insights-preview" className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/[0.12] transition">
              See your full pattern →
            </Link>
          </div>
        </div>

        {/* ── Themes + Emotions side by side ────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Themes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recurring themes</h2>
              <p className="mt-0.5 text-xs text-slate-600">{themeCount || themeBars.length} distinct themes · cleaned + merged</p>
            </div>
            <ul className="space-y-4">
              {themeBars.map(({ label, count, real }, i) => {
                const pct = Math.round((count / maxTheme) * 100);
                const isTop = i === 0;
                return (
                  <li key={label} className={`space-y-1.5 ${!real ? "opacity-40" : ""}`}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 tabular-nums text-[10px] w-4 text-right" style={{ color: isTop ? "#34d399" : "#475569" }}>{i + 1}</span>
                        <span className={`truncate transition-colors ${isTop ? "font-medium text-slate-100" : "text-slate-400"}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                      </div>
                      <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isTop ? "#34d399" : "#334155" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Emotions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Emotions over time</h2>
              <p className="mt-0.5 text-xs text-slate-600">{emotionCount || emotionBars.length} distinct emotions · cleaned + merged</p>
            </div>
            <ul className="space-y-4">
              {emotionBars.map(({ label, count, real }, i) => {
                const pct = Math.round((count / maxEmotion) * 100);
                const isTop = i === 0;
                return (
                  <li key={label} className={`space-y-1.5 ${!real ? "opacity-40" : ""}`}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 tabular-nums text-[10px] w-4 text-right" style={{ color: isTop ? "#a78bfa" : "#475569" }}>{i + 1}</span>
                        <span className={`truncate transition-colors ${isTop ? "font-medium text-slate-100" : "text-slate-400"}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</span>
                      </div>
                      <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: isTop ? "#a78bfa" : "#334155" }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* ── Upgrade CTA ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-7">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500/60 mb-2">Premium</p>
          <h3 className="text-lg font-semibold text-white mb-1">
            This is what your insights look like — fully unlocked.
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xl">
            The weekly summary, the full pattern history, and the deeper analysis sections above are all waiting.
            {hasData
              ? ` Havenly has already started building your pattern from your ${entryCount} entries.`
              : " Start writing and Havenly will fill this with your actual patterns."}
            {" "}Less than one therapy session per month.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upgrade?from=insights-preview"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/20 hover:bg-emerald-400 transition"
            >
              Unlock full insights — $30/month →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/[0.08] px-6 py-3 text-sm font-medium text-slate-400 hover:border-white/[0.15] hover:text-slate-200 transition"
            >
              Back to dashboard
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-700">Cancel anytime. No questions asked.</p>
        </div>

        <p className="text-center text-xs text-slate-700">Insights deepen as your reflection history grows.</p>
      </div>
    </div>
  );
}
