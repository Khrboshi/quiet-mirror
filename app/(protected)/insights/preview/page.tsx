// app/(protected)/insights/preview/page.tsx
export const dynamic = "force-dynamic";

/**
 * app/(protected)/insights/preview/page.tsx
 *
 * Insights upgrade teaser for free users — shows a blurred/locked preview
 * of the insights dashboard with an upgrade CTA.
 * Redirects Premium/Trial users directly to /insights.
 */
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import UpgradeIntentTracker from "@/app/components/UpgradeIntentTracker";
import { PRICING } from "@/app/lib/pricing";
import { getRequestTranslations } from "@/app/lib/i18n/server";

// ── Data fetching ─────────────────────────────────────────────────────────────

async function getUserInsightData(userId: string) {
  const supabase = await createServerSupabase();

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

  const NOISE_THEMES = new Set(["self-awareness", "processing", "presence",
    "consistency", "recovery", "self-respect", "motivation", "recognition",
    "boundaries", "self-worth", "connection", "visibility"]);
  const NOISE_EMOTIONS = new Set(["uncertainty", "restlessness", "quiet courage",
    "pride", "tiredness", "determination", "frustration", "hurt", "longing", "confusion"]);

  for (const row of rows ?? []) {
    let parsed: unknown = null;
    try {
      parsed = typeof row.ai_response === "string"
        ? JSON.parse(row.ai_response) : row.ai_response;
    } catch { continue; }
    if (!parsed || typeof parsed !== "object") continue;
    const parsedObj = parsed as Record<string, unknown>;

    entryCount++;

    for (const t of Array.isArray(parsedObj.themes) ? parsedObj.themes : []) {
      const k = String(t || "").trim().toLowerCase();
      if (!k || NOISE_THEMES.has(k)) continue;
      themes[k] = (themes[k] || 0) + 1;
    }
    for (const e of Array.isArray(parsedObj.emotions) ? parsedObj.emotions : []) {
      const k = String(e || "").trim().toLowerCase();
      if (!k || NOISE_EMOTIONS.has(k)) continue;
      emotions[k] = (emotions[k] || 0) + 1;
    }
    const domain = typeof parsedObj.domain === "string"
      ? parsedObj.domain.trim().toUpperCase() : "";
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

function sc(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InsightsPreviewPage() {
  const t      = await getRequestTranslations();
  const ip     = t.insightPreview;
  const ps     = t.pricingStrings;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const insightData = user
    ? await getUserInsightData(user.id)
    : { entryCount: 0, sortedThemes: [], sortedEmotions: [], sortedDomains: [], topTheme: null, topEmotion: null, topDomain: null };

  const {
    entryCount, sortedThemes, sortedEmotions, sortedDomains,
    topTheme, topEmotion, topDomain,
  } = insightData;

  const hasData = entryCount >= 2 && (topTheme || topEmotion);

  // DOMAIN_LABELS built from translations — no hardcoded strings
  const DOMAIN_LABELS: Record<string, { label: string; emoji: string }> = {
    MONEY:        { label: ip.domainMoney,        emoji: "💰" },
    WORK:         { label: ip.domainWork,          emoji: "💼" },
    RELATIONSHIP: { label: ip.domainRelationship,  emoji: "🤝" },
    HEALTH:       { label: ip.domainHealth,        emoji: "🫀" },
    GRIEF:        { label: ip.domainGrief,         emoji: "🕊️" },
    PARENTING:    { label: ip.domainParenting,     emoji: "🌱" },
    CREATIVE:     { label: ip.domainCreative,      emoji: "✍️" },
    IDENTITY:     { label: ip.domainIdentity,      emoji: "🪞" },
    FITNESS:      { label: ip.domainFitness,       emoji: "⚡" },
  };

  const topDomainMeta = topDomain
    ? (DOMAIN_LABELS[topDomain] ?? { label: topDomain.toLowerCase(), emoji: "📝" })
    : null;

  const themeBars   = sortedThemes.slice(0, 6);
  const emotionBars = sortedEmotions.slice(0, 6);
  const domainBars  = sortedDomains.slice(0, 7);

  const maxTheme   = Math.max(...themeBars.map(([, v]) => v), 1);
  const maxEmotion = Math.max(...emotionBars.map(([, v]) => v), 1);
  const maxDomain  = Math.max(...domainBars.map(([, v]) => v), 1);

  // Momentum example label from shared translations
  const momentumExample = t.insights.momentumDescriptions["Shifting"] ?? "Shifting";

  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      <UpgradeIntentTracker source="insights-preview" />

      {/* ── Sticky banner ───────────────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 border-b border-qm-positive-border bg-[var(--qm-bg-glass-95)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <p className="text-xs text-qm-muted">
            <span className="font-medium text-qm-positive">{ip.bannerLabel}</span>
            {" "}{ip.bannerText}
          </p>
          <Link
            href="/upgrade?from=insights-preview"
            className="shrink-0 rounded-full bg-qm-accent px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-qm-accent-hover"
          >
            {ip.bannerCta}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 pb-16 sm:px-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-qm-primary sm:text-4xl">{ip.heading}</h1>
          <p className="mt-1 text-sm text-qm-faint">
            {hasData
              ? <>{ip.subHasDataPrefix}{" "}<span className="text-qm-muted">{ip.subHasDataCount(entryCount)}</span></>
              : ip.subNoData}
          </p>
        </div>

        {/* ── Stat cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">{t.insights.entries}</p>
            <p className="text-base font-semibold text-qm-primary">{entryCount}</p>
            <p className="text-xs text-qm-faint">{t.insights.sinceJoined}</p>
          </div>
          <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">{t.insights.topEmotion}</p>
            <p className="text-base font-semibold capitalize truncate" style={{ color: hasData ? "var(--qm-dv-grief)" : "var(--qm-bg-card)" }}>
              {hasData && topEmotion ? sc(topEmotion) : "—"}
            </p>
            <p className="text-xs text-qm-faint">{hasData ? `${sortedEmotions[0]?.[1]} ${sortedEmotions[0]?.[1] === 1 ? t.dashboard.entry : t.dashboard.entries}` : ip.statBuilds}</p>
          </div>
          <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">{t.insights.topTheme}</p>
            <p className="text-base font-semibold capitalize truncate" style={{ color: hasData ? "var(--qm-dv-positive)" : "var(--qm-bg-card)" }}>
              {hasData && topTheme ? sc(topTheme) : "—"}
            </p>
            <p className="text-xs text-qm-faint">{hasData ? `${sortedThemes[0]?.[1]} ${sortedThemes[0]?.[1] === 1 ? t.dashboard.entry : t.dashboard.entries}` : ip.statBuilds}</p>
          </div>
          <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">{t.insights.momentum}</p>
            <p className="text-base font-semibold" style={{ color: hasData ? "var(--qm-dv-creative)" : "var(--qm-bg-card)" }}>
              {hasData ? momentumExample : "—"}
            </p>
            <p className="text-xs text-qm-faint">{hasData ? ip.statMomentumRecent : ip.statBuilds}</p>
          </div>
        </div>

        {/* ── Weekly summary — always locked ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-qm-border-subtle bg-gradient-to-br from-qm-elevated to-qm-bg p-6 md:p-7">
          <div className="mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">{ip.weeklySectionLabel}</h2>
            <p className="mt-0.5 text-xs text-qm-faint">{ip.weeklySectionSub}</p>
          </div>
          <div className="pointer-events-none select-none space-y-4 blur-[3px]">
            <p className="text-base leading-relaxed text-qm-primary">
              {ip.demoParagraph1}
            </p>
            <p className="text-sm leading-relaxed text-qm-muted">
              {ip.demoParagraph2}
            </p>
            <p className="text-sm text-qm-muted">
              {ip.demoParagraph3}
            </p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-qm-bg backdrop-blur-[1px]">
            <p className="px-4 text-center text-sm font-medium text-qm-secondary">{ip.weeklyLockTitle}</p>
            <p className="max-w-xs px-4 text-center text-xs text-qm-faint">{ip.weeklyLockBody}</p>
            <Link href="/upgrade?from=insights-preview"
              className="mt-1 rounded-full bg-qm-accent px-5 py-2 text-xs font-semibold text-white transition hover:bg-qm-accent-hover">
              {ip.weeklyLockCta}
            </Link>
          </div>
        </div>

        {/* ── What you write about most ───────────────────────────────────── */}
        <div className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint mb-1">{ip.domainSectionLabel}</h2>
          <p className="mb-5 text-xs text-qm-faint">
            {hasData ? ip.domainSubHasData : ip.domainSubNoData}
          </p>

          {hasData ? (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-qm-border-subtle bg-qm-elevated px-4 py-3">
                <span className="text-2xl">{topDomainMeta?.emoji ?? "📝"}</span>
                <div>
                  <p className="text-sm font-semibold text-blue-400">{topDomainMeta?.label ?? topDomain}</p>
                  <p className="text-xs text-qm-faint">{ip.domainTopArea}</p>
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
                        <span className="flex items-center gap-1.5 text-qm-secondary">
                          <span>{meta.emoji}</span>
                          <span className={isTop ? "font-medium" : "text-qm-muted"}>{meta.label}</span>
                        </span>
                        <span className="tabular-nums text-qm-faint">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "var(--qm-dv-work)" : "var(--qm-bg-soft)" }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="space-y-3">
              {Object.entries(DOMAIN_LABELS).slice(0, 7).map(([key, meta], i) => (
                <div key={key} className="space-y-1 opacity-20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-qm-muted">
                      <span>{meta.emoji}</span>
                      <span>{meta.label}</span>
                    </span>
                  </div>
                  <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                    <div className="h-full rounded-full bg-qm-soft" style={{ width: `${Math.max(8, 90 - i * 13)}%` }} />
                  </div>
                </div>
              ))}
              <p className="pt-2 text-xs text-qm-faint">{ip.domainEmptyBody}</p>
            </div>
          )}
        </div>

        {/* ── Narrative patterns — partially locked ───────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-qm-border-subtle bg-gradient-to-br from-qm-elevated to-qm-bg">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-qm-border-subtle">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-qm-faint">{ip.patternSectionLabel}</p>
                <p className="mt-0.5 text-xs text-qm-faint">{ip.corepatternSub}</p>
              </div>
              <span className="shrink-0 rounded-full border border-qm-positive-border bg-qm-positive-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-qm-positive">
                {ip.upgradePremiumLabel}
              </span>
            </div>
          </div>

          <div className="px-6 py-5 space-y-3">

            {/* Row 1 — real data or plausible example, always visible */}
            <div className="rounded-xl border border-qm-positive-border bg-qm-positive-bg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-relaxed text-qm-primary">
                  <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-qm-positive align-middle" />
                  {hasData && topTheme
                    ? ip.corepatternHasData(sc(topTheme))
                    : ip.corepatternNoData}
                </p>
                <span className="shrink-0 rounded-full bg-qm-positive-soft px-2 py-0.5 text-xs tabular-nums text-qm-positive">
                  {hasData ? `${sortedThemes[0]?.[1] ?? 1}×` : "·"}
                </span>
              </div>
              <p className="mt-2 ps-4 text-xs text-qm-faint">
                {hasData ? ip.corepatternSubHasData : ip.corepatternSubNoData}
              </p>
            </div>

            {/* Row 2 — surface the top emotion pattern if available, else blur */}
            {hasData && topEmotion && topTheme ? (
              <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 blur-[2px] pointer-events-none select-none">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-qm-muted">
                    <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-qm-muted align-middle" />
                    {ip.patternHasData(sc(topEmotion), topTheme)}
                  </p>
                  <span className="shrink-0 tabular-nums text-xs text-qm-faint pt-0.5">
                    {sortedEmotions[0]?.[1] ?? 1}×
                  </span>
                </div>
                <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-qm-card">
                  <div className="h-full rounded-full bg-qm-soft" style={{ width: "72%" }} />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4 blur-[2px] pointer-events-none select-none">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-relaxed text-qm-muted">
                    <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-qm-muted align-middle" />
                    {ip.corepatternBlur1}
                  </p>
                  <span className="shrink-0 tabular-nums text-xs text-qm-faint pt-0.5">3×</span>
                </div>
                <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-qm-card">
                  <div className="h-full rounded-full bg-qm-soft" style={{ width: "68%" }} />
                </div>
              </div>
            )}

            {/* Rows 3–4 — always blurred placeholders */}
            <div className="space-y-3 blur-sm pointer-events-none select-none">
              {[ip.corepatternBlur2, ip.corepatternBlur3].map((text, i) => (
                <div key={i} className="rounded-xl border border-qm-border-subtle bg-qm-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs leading-relaxed text-qm-muted">
                      <span className="me-2 inline-block h-1.5 w-1.5 rounded-full bg-qm-muted align-middle" />
                      {text}
                    </p>
                    <span className="shrink-0 tabular-nums text-xs text-qm-faint pt-0.5">{2 - i}×</span>
                  </div>
                  <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-qm-card">
                    <div className="h-full rounded-full bg-qm-soft" style={{ width: `${50 - i * 18}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient fade + unlock CTA */}
          <div className="absolute bottom-0 inset-x-0 h-40 flex flex-col items-center justify-end gap-3 bg-gradient-to-t from-qm-bg via-qm-bg/90 to-transparent pb-6">
            <p className="px-4 text-center text-xs text-qm-faint">{ip.patternNote}</p>
            <Link
              href="/upgrade?from=insights-preview"
              className="inline-flex items-center gap-2 rounded-full border border-qm-positive-border bg-qm-positive-strong/[0.06] px-5 py-2 text-xs font-semibold text-qm-positive transition hover:bg-qm-positive-strong/[0.12]"
            >
              {ip.corepatternLockCta}
            </Link>
          </div>

          {/* Bottom padding so gradient has room */}
          <div className="h-20" />
        </div>

        {/* ── Recurring themes + Emotions ─────────────────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">

          {/* Themes */}
          <div className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">{ip.themesSectionLabel}</h2>
              <p className="mt-0.5 text-xs text-qm-faint">
                {hasData ? ip.themesSubHasData(themeBars.length) : ip.detectedFromReflections}
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
                          <span className="w-4 shrink-0 text-end tabular-nums text-[10px]" style={{ color: isTop ? "var(--qm-dv-positive)" : "var(--qm-text-muted)" }}>{i + 1}</span>
                          <span className={`truncate ${isTop ? "font-medium text-qm-primary" : "text-qm-muted"}`}>{sc(label)}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-xs text-qm-faint">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "var(--qm-dv-positive)" : "var(--qm-bg-card)" }} />
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
                      <div className="h-3 w-32 rounded-full bg-qm-soft" />
                      <div className="h-3 w-4 rounded-full bg-qm-soft" />
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                      <div className="h-full rounded-full bg-qm-soft" style={{ width: `${90 - i * 20}%` }} />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-qm-faint">{ip.appearsAfterEntries}</p>
              </div>
            )}
          </div>

          {/* Emotions */}
          <div className="rounded-2xl border border-qm-border-subtle bg-qm-bg p-6">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-qm-faint">{ip.emotionsSectionLabel}</h2>
              <p className="mt-0.5 text-xs text-qm-faint">
                {hasData ? ip.emotionsSubHasData(emotionBars.length) : ip.detectedFromReflections}
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
                          <span className="w-4 shrink-0 text-end tabular-nums text-[10px]" style={{ color: isTop ? "var(--qm-dv-grief)" : "var(--qm-text-muted)" }}>{i + 1}</span>
                          <span className={`truncate ${isTop ? "font-medium text-qm-primary" : "text-qm-muted"}`}>{sc(label)}</span>
                        </div>
                        <span className="shrink-0 tabular-nums text-xs text-qm-faint">{count}</span>
                      </div>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: isTop ? "var(--qm-dv-grief)" : "var(--qm-bg-card)" }} />
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
                      <div className="h-3 w-28 rounded-full bg-qm-soft" />
                      <div className="h-3 w-4 rounded-full bg-qm-soft" />
                    </div>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-qm-card">
                      <div className="h-full rounded-full bg-qm-soft" style={{ width: `${90 - i * 20}%` }} />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-qm-faint">{ip.appearsAfterEntries}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Upgrade CTA ─────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.04] p-7">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-qm-positive">{ip.upgradePremiumLabel}</p>
          <h3 className="mb-1 text-lg font-semibold text-qm-primary">
            {hasData ? ip.upgradeHeadingHasData : ip.upgradeHeadingNoData}
          </h3>
          <p className="mb-5 max-w-xl text-sm leading-relaxed text-qm-muted">
            {hasData ? ip.upgradeBodyHasData(entryCount) : ip.upgradeBodyNoData}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/upgrade?from=insights-preview"
              className="inline-flex items-center gap-2 rounded-full bg-qm-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-qm-accent-hover"
            >
              {ip.upgradeCta(ps.perMonth(PRICING.monthly))}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full border border-white/[0.08] px-6 py-3 text-sm font-medium text-qm-muted transition hover:border-white/[0.15] hover:text-qm-primary"
            >
              {ip.upgradeBack}
            </Link>
          </div>
          <p className="mt-4 text-xs text-qm-faint">{ip.upgradeRefund(PRICING.trialDays)}</p>
        </div>

        <p className="text-center text-xs text-qm-faint">{ip.footerNote}</p>
      </div>
    </div>
  );
}
