// app/(protected)/insights/preview/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import UpgradeIntentTracker from "@/app/components/UpgradeIntentTracker";

// ── Data fetching ─────────────────────────────────────────────────────────────

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

  // Filter out generic/noise signals that don't tell the user anything meaningful
  const NOISE_THEMES = new Set(["self-awareness", "processing", "presence",
    "consistency", "recovery", "self-respect", "motivation", "recognition",
    "boundaries", "self-worth", "connection", "visibility"]);
  const NOISE_EMOTIONS = new Set(["uncertainty", "restlessness", "quiet courage",
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
      if (!k || NOISE_THEMES.has(k)) continue;
      themes[k] = (themes[k] || 0) + 1;
    }
    for (const e of Array.isArray(parsed?.emotions) ? parsed.emotions : []) {
      const k = String(e || "").trim().toLowerCase();
      if (!k || NOISE_EMOTIONS.has(k)) continue;
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
  const sortedDomains = Object.entries(domains).sort((a, b) => b[1] - a[1]);

  return {
    entryCount,
    sortedThemes,
    sortedEmotions,
    sortedDomains,
    topTheme: sortedThemes[0]?.[0] ?? null,
    topEmotion: sortedEmotions[0]?.[0] ?? null,
    topDomain: sortedDomains[0]?.[0] ?? null,
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

function sc(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InsightsPreviewPage() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/magic-login");

  const {
    entryCount, sortedThemes, sortedEmotions, sortedDomains,
    topTheme, topEmotion, topDomain,
  } = await getUserInsightData(user.id);

  // hasData = user has at least 2 reflected entries with meaningful signals
  const hasData = entryCount >= 2 && (topTheme || topEmotion);

  const topDomainMeta = topDomain
    ? (DOMAIN_LABELS[topDomain] ?? { label: topDomain.toLowerCase(), emoji: "📝" })
    : null;

  // Real bars — only shown when hasData is true
  const themeBars  = sortedThemes.slice(0, 6);
  const emotionBars = sortedEmotions.slice(0, 6);
  const domainBars  = sortedDomains.slice(0, 7);

  const maxTheme   = Math.max(...themeBars.map(([, v]) => v), 1);
  const maxEmotion = Math.max(...emotionBars.map(([, v]) => v), 1);
  const maxDomain  = Math.max(...domainBars.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <UpgradeIntentTracker source="insights-preview" />

      {/* ── Sticky banner ───────────────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 border-b border-emerald-500/10 bg-slate-950/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <p className="text-xs text-slate-400">
            <span className="font-medium text-emerald-400">Premium preview</span>
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

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">Insights</h1>
          <p className="mt-1 text-sm text-slate-500">
            {hasData
              ? <>What Havenly has noticed across your{" "}<span className="text-slate-400">{entryCount} {entryCount === 1 ? "entry" : "entries"}</span></>
              : "What Havenly will notice once you start writing"}
          </p>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Entries</p>
            <p className="text-base font-semibold text-slate-200">{entryCount}</p>
            <p className="text-xs text-slate-600">Since you joined</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Top emotion</p>
            <p className="text-base font-semibold capitalize truncate" style={{ color: hasData ? "#a78bfa" : "#334155" }}>
              {hasData && topEmotion ? sc(topEmotion) : "—"}
            </p>
            <p className="text-xs text-slate-600">{hasData ? `${sortedEmotions[0]?.[1]} ${sortedEmotions[0]?.[1] === 1 ? "entry" : "entries"}` : "Builds as you write"}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Top theme</p>
            <p className="text-base font-semibold capitalize truncate" style={{ color: hasData ? "#34d399" : "#334155" }}>
              {hasData && topTheme ? sc(topTheme) : "—"}
            </p>
            <p className="text-xs text-slate-600">{hasData ? `${sortedThemes[0]?.[1]} ${sortedThemes[0]?.[1] === 1 ? "entry" : "entries"}` : "Builds as you write"}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">Momentum</p>
            <p className="text-base font-semibold" style={{ color: hasData ? "#fbbf24" : "#334155" }}>
              {hasData ? "Shifting" : "—"}
            </p>
            <p className="text-xs text-slate-600">{hasData ? "Based on recent entries" : "Builds as you write"}</p>
          </div>
        </div>

        {/* ── Weekly summary — always locked ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-7">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">What Havenly has noticed</h2>
            <p className="mt-0.5 text-xs text-slate-700">A personal summary generated from your reflection history.</p>
          </div>
          {/* Blurred demo text — always the same, clearly decorative */}
          <div className="pointer-events-none select-none space-y-4 blur-[3px]">
            <p className="text-base leading-relaxed text-slate-200">
              You often write about work and career, relationships, and general life reflections,
              with a sense of apprehension simmering beneath the surface. Your entries are filled
              with moments of effort and relief, but the pressure to perform is a constant companion.
            </p>
            <p className="text-sm leading-relaxed text-slate-400">
              A pattern has emerged: stress is often intensified by feelings of being unseen or
              undervalued. This sense of disconnection is recurring, and it&apos;s affecting your well-being.
            </p>
            <p className="text-sm text-slate-400">
              What&apos;s been on your mind lately, and how have you been taking care of yourself?
            </p>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/50 backdrop-blur-[1px]">
            <p className="px-4 text-center text-sm font-medium text-slate-300">Your personal weekly summary</p>
            <p className="max-w-xs px-4 text-center text-xs text-slate-500">
              Havenly reads all your entries and writes this in plain language — what it noticed, what&apos;s shifting, what keeps returning.
            </p>
            <Link href="/upgrade?from=insights-preview"
              className="mt-1 rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400">
              Unlock your summary →
            </Link>
          </div>
        </div>

        {/* ── What you write about most ───────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">What you write about most</h2>
          <p className="mb-5 text-xs text-slate-600">
            {hasData
              ? "Domain detected across all reflected entries."
              : "Havenly detects what area of life each entry belongs to."}
          </p>

          {hasData ? (
            /* ── Real domain data ── */
            <>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <span className="text-2xl">{topDomainMeta?.emoji ?? "📝"}</span>
                <div>
                  <p className="text-sm font-semibold text-blue-400">{topDomainMeta?.label ?? topDomain}</p>
                  <p className="text-xs text-slate-500">Your most written-about area</p>
                </div>
              </div>
              <ul className="space-y-3">
                {domainBars.map(([key, count], i) => {
                  const meta = DOMAIN_LABELS[key] ?? { label: key.toLowerCase(), emoji: "📝" };
                  const pct = Math.round((count / maxDomain) * 100);
                  const isTop = i === 0;
                  return (
                    <li key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <span>{meta.emoji}</span>
                          <span className={isTop ? "font-medium" : "text-slate-400"}>{meta.label}</span>
                        </span>
                        <span className="tabular-nums text-slate-600">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "#60a5fa" : "#1e293b" }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            /* ── Empty state — no fake data ── */
            <div className="space-y-3">
              {Object.entries(DOMAIN_LABELS).slice(0, 7).map(([key, meta], i) => (
                <div key={key} className="space-y-1 opacity-20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-slate-700" style={{ width: `${Math.max(8, 90 - i * 13)}%` }} />
                  </div>
                </div>
              ))}
              <p className="pt-2 text-xs text-slate-600">
                Start writing and Havenly will detect what area of life each entry belongs to.
              </p>
            </div>
          )}
        </div>

        {/* ── The pattern underneath ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 to-slate-900/40 p-7">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">The pattern underneath</p>

          {hasData ? (
            <>
              <p className="text-lg leading-relaxed text-slate-300">
                <span className="font-semibold text-slate-100">{sc(topEmotion!)}</span>{" "}
                keeps showing up — often alongside{" "}
                <span className="font-semibold text-slate-100">{topTheme}</span>.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-600">Recently:</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  ↑ {topEmotion}
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-600">These are patterns, not diagnoses. They shift as you keep writing.</p>
            </>
          ) : (
            <>
              <p className="text-base leading-relaxed text-slate-400">
                As your entries build up, Havenly notices which emotion keeps surfacing — and what theme it keeps showing up alongside.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 opacity-30 pointer-events-none select-none">
                <span className="text-xs text-slate-600">Recently:</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  ↑ emotion
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-600">Appears after a few entries with reflections.</p>
            </>
          )}
        </div>

        {/* ── What you keep coming back to — locked ───────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">What you keep coming back to</h2>
          <p className="mb-5 text-xs text-slate-600">The specific dynamic Havenly noticed most often beneath your entries.</p>

          {/* Top pattern card — shown (demo copy, same for everyone — it's a product example) */}
          <div className="mb-4 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-relaxed text-slate-100">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
                {hasData && topTheme
                  ? `${sc(topTheme)} keeps appearing alongside a sense of feeling unseen or behind.`
                  : "Work stress is being sharpened by feeling unseen, undervalued, or behind."}
              </p>
              <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs tabular-nums text-emerald-400">
                {hasData ? `${sortedThemes[0]?.[1] ?? 1}×` : "·"}
              </span>
            </div>
            <p className="mt-2 pl-4 text-xs text-slate-600">
              {hasData ? "Your most recurring underlying pattern" : "Example — yours will be built from your own entries"}
            </p>
          </div>

          {/* Deeper patterns — always blurred */}
          <div className="pointer-events-none select-none space-y-3 blur-sm">
            {[
              "You're caught between maintaining the relationship and expressing your own emotional needs.",
              "Financial stress is affecting your sense of safety, control, and self-worth.",
              "The fear of uncertainty is triggering a physical response.",
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs leading-relaxed text-slate-400">{p}</p>
                  <span className="shrink-0 pt-0.5 tabular-nums text-xs text-slate-700">{i + 1}×</span>
                </div>
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-slate-700" style={{ width: `${70 - i * 20}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Lock gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pb-5">
            <Link href="/upgrade?from=insights-preview"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-2 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/[0.12]">
              See your full pattern →
            </Link>
          </div>
        </div>

        {/* ── Recurring themes + Emotions ─────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Themes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Recurring themes</h2>
              <p className="mt-0.5 text-xs text-slate-600">
                {hasData
                  ? `${themeBars.length} distinct themes · cleaned + merged`
                  : "Detected and merged from your reflections"}
              </p>
            </div>

            {hasData ? (
              <ul className="space-y-4">
                {themeBars.map(([label, count], i) => {
                  const pct = Math.round((count / maxTheme) * 100);
                  const isTop = i === 0;
                  return (
                    <li key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-4 shrink-0 text-right tabular-nums text-[10px]" style={{ color: isTop ? "#34d399" : "#475569" }}>{i + 1}</span>
                          <span className={`truncate ${isTop ? "font-medium text-slate-100" : "text-slate-400"}`}>{sc(label)}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "#34d399" : "#334155" }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-4">
                {["Theme will appear here", "Theme will appear here", "Theme will appear here", "Theme will appear here"].map((_, i) => (
                  <div key={i} className="space-y-1.5 opacity-20">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-3 w-32 rounded-full bg-slate-700" />
                      <div className="h-3 w-4 rounded-full bg-slate-700" />
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                      <div className="h-full rounded-full bg-slate-700" style={{ width: `${90 - i * 20}%` }} />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-slate-600">Appears once you have a few reflected entries.</p>
              </div>
            )}
          </div>

          {/* Emotions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Emotions over time</h2>
              <p className="mt-0.5 text-xs text-slate-600">
                {hasData
                  ? `${emotionBars.length} distinct emotions · cleaned + merged`
                  : "Detected and merged from your reflections"}
              </p>
            </div>

            {hasData ? (
              <ul className="space-y-4">
                {emotionBars.map(([label, count], i) => {
                  const pct = Math.round((count / maxEmotion) * 100);
                  const isTop = i === 0;
                  return (
                    <li key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-4 shrink-0 text-right tabular-nums text-[10px]" style={{ color: isTop ? "#a78bfa" : "#475569" }}>{i + 1}</span>
                          <span className={`truncate ${isTop ? "font-medium text-slate-100" : "text-slate-400"}`}>{sc(label)}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-xs text-slate-600">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "#a78bfa" : "#334155" }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1.5 opacity-20">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-3 w-28 rounded-full bg-slate-700" />
                      <div className="h-3 w-4 rounded-full bg-slate-700" />
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-slate-800/80">
                      <div className="h-full rounded-full bg-slate-700" style={{ width: `${90 - i * 20}%` }} />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-slate-600">Appears once you have a few reflected entries.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Upgrade CTA ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-500/60">Premium</p>
          <h3 className="mb-1 text-lg font-semibold text-white">
            {hasData
              ? "Your pattern is already forming. Unlock it."
              : "This is what your insights look like — fully unlocked."}
          </h3>
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-slate-400">
            {hasData
              ? `Havenly has already started building your pattern from your ${entryCount} ${entryCount === 1 ? "entry" : "entries"}. Premium unlocks the full timeline, weekly summary, and the deeper analysis above.`
              : "Start writing and Havenly will fill this with your actual patterns — the weekly summary, full pattern history, and deeper analysis. Less than one therapy session per month."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upgrade?from=insights-preview"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              Unlock full insights — $30/month →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/[0.08] px-6 py-3 text-sm font-medium text-slate-400 transition hover:border-white/[0.15] hover:text-slate-200"
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
