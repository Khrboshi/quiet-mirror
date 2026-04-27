// app/(protected)/journal/page.tsx
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations, getLocaleFromCookieString, getIntlLocale } from "@/app/lib/i18n";
import { cookies } from "next/headers";
import { parseAIResponse } from "@/lib/planUtils";
import { DOMAIN_COLOR, QM } from "@/app/lib/colors";

export const dynamic = "force-dynamic";

// ── Domain metadata ────────────────────────────────────────────────────────────

const DOMAIN_META: Record<string, { emoji: string; color: string }> = {
  MONEY:        { emoji: "💰", color: DOMAIN_COLOR.MONEY },
  WORK:         { emoji: "💼", color: DOMAIN_COLOR.WORK },
  RELATIONSHIP: { emoji: "🤝", color: DOMAIN_COLOR.RELATIONSHIP },
  HEALTH:       { emoji: "🫀", color: DOMAIN_COLOR.HEALTH },
  GRIEF:        { emoji: "🕊️", color: DOMAIN_COLOR.GRIEF },
  PARENTING:    { emoji: "🌱", color: DOMAIN_COLOR.PARENTING },
  CREATIVE:     { emoji: "✍️", color: DOMAIN_COLOR.CREATIVE },
  IDENTITY:     { emoji: "🪞", color: DOMAIN_COLOR.IDENTITY },
  FITNESS:      { emoji: "⚡", color: DOMAIN_COLOR.FITNESS },
  GENERAL:      { emoji: "📝", color: QM.textMuted },
};

// ── Emotion color mapping ──────────────────────────────────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  fear: QM.dv.fear, panic: QM.dv.fear, terror: QM.dv.fear, dread: QM.dv.fear,
  rage: QM.dv.fear, fury: QM.dv.fear, anger: QM.dv.fear,
  anxiety: QM.dv.health, worry: QM.dv.health, stress: QM.dv.health, overwhelmed: QM.dv.health,
  frustration: QM.dv.health, irritation: QM.dv.health,
  shame: QM.dv.creative, guilt: QM.dv.creative, embarrassment: QM.dv.creative,
  sadness: QM.textSecondary, grief: QM.textSecondary, loneliness: QM.textSecondary,
  exhaustion: QM.textSecondary, numbness: QM.textSecondary, emptiness: QM.textSecondary,
  disconnection: QM.textSecondary, resignation: QM.textSecondary,
  confusion: QM.dv.grief, doubt: QM.dv.grief, uncertainty: QM.dv.grief,
  invisibility: QM.dv.grief, "self-doubt": QM.dv.grief,
  hope: QM.dv.positive, relief: QM.dv.positive, calm: QM.dv.positive, gratitude: QM.dv.positive,
  pride: QM.dv.positive, joy: QM.dv.positive, contentment: QM.dv.positive,
  curiosity: QM.dv.work, openness: QM.dv.work, clarity: QM.dv.work,
  love: QM.dv.love, connection: QM.dv.love, tenderness: QM.dv.love,
};

function emotionColor(e: string): string {
  return EMOTION_COLORS[e.toLowerCase().trim()] ?? QM.textMuted;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDay(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(getIntlLocale(locale), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function monthKey(iso: string, locale: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(getIntlLocale(locale), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function entryTitle(
  title: string | null,
  content: string | null,
  fallback: string
): string {
  if (title?.trim()) return title.trim();
  const first = (content ?? "").split(/[.!?\n]/)[0].trim();
  if (first.length > 4) return first.length > 60 ? first.slice(0, 57) + "…" : first;
  return fallback;
}

function parseAI(
  raw: string | Record<string, unknown> | null
): Record<string, unknown> | null {
  return parseAIResponse(raw);
}

// Compute which weekday the user writes on most (UTC-based)
function mostActiveDay(
  entries: Array<{ created_at: string }>,
  locale: string
): string | null {
  if (entries.length < 5) return null;
  const counts = new Array<number>(7).fill(0);
  for (const e of entries) {
    const d = new Date(e.created_at);
    counts[d.getUTCDay()]++;
  }
  const maxIdx = counts.indexOf(Math.max(...counts));
  const maxCount = counts[maxIdx];
  // Only show if that day has at least 1.5× the average
  const avg = entries.length / 7;
  if (maxCount < avg * 1.5) return null;

  try {
    // Sunday = 0, anchor to 2024-01-07 (a Sunday)
    const ref = new Date("2024-01-07T12:00:00Z");
    ref.setUTCDate(ref.getUTCDate() + maxIdx);
    return ref.toLocaleDateString(getIntlLocale(locale), {
      weekday: "long",
      timeZone: "UTC",
    });
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JournalPage() {
  const cookieHeader = (await cookies()).toString();
  const locale = getLocaleFromCookieString(cookieHeader);
  const t = getTranslations(locale);
  const supabase = await createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/magic-login");

  const { data: rawEntries } = await supabase
    .from("journal_entries")
    .select("id, created_at, title, content, ai_response")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const entries = (rawEntries ?? []) as Array<{
    id: string;
    created_at: string;
    title: string | null;
    content: string | null;
    ai_response: string | Record<string, unknown> | null;
  }>;

  type JournalEntry = (typeof entries)[number];

  // Group by month
  const groups: { month: string; entries: JournalEntry[] }[] = [];
  for (const entry of entries) {
    const month = monthKey(entry.created_at, locale);
    const last = groups[groups.length - 1];
    if (last?.month === month) {
      last.entries.push(entry);
    } else {
      groups.push({ month, entries: [entry] });
    }
  }

  const activeDayName = mostActiveDay(entries, locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-qm-primary">
            {t.journalPage.heading}
          </h1>
          <p className="mt-1 text-sm text-qm-faint">
            {entries.length > 0 && t.journalPage.entryCount(entries.length)}
            {activeDayName && (
              <> · {t.journalPage.writingMostOn(activeDayName)}</>
            )}
          </p>
        </div>
        <Link
          href="/journal/new"
          className="shrink-0 rounded-full bg-qm-positive-strong px-4 py-2 text-sm font-medium text-white hover:bg-qm-positive transition-colors"
        >
          {t.journalPage.newEntry}
        </Link>
      </div>

      {/* ── Empty state ── */}
      {entries.length === 0 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-qm-border-subtle bg-qm-elevated p-8 text-center space-y-2">
            <p className="text-2xl">✦</p>
            <p className="text-sm text-qm-secondary font-medium">
              {t.journalPage.emptyHeading}
            </p>
            <p className="text-xs text-qm-faint">{t.journalPage.emptyBody}</p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-qm-faint">
              {t.journalPage.startHere}
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  q: t.journalPage.prompt1,
                  sub: t.journalPage.prompt1Sub,
                  color: "border-qm-positive-border hover:border-qm-positive",
                },
                {
                  q: t.journalPage.prompt2,
                  sub: t.journalPage.prompt2Sub,
                  color: "border-qm-premium-border hover:border-qm-premium",
                },
                {
                  q: t.journalPage.prompt3,
                  sub: t.journalPage.prompt3Sub,
                  color: "border-qm-warning-border hover:border-qm-warning",
                },
              ].map((p) => (
                <Link
                  key={p.q}
                  href={`/journal/new?prompt=${encodeURIComponent(p.q)}`}
                  className={`group rounded-2xl border bg-white/[0.02] p-5 transition hover:bg-white/[0.05] ${p.color}`}
                >
                  <p className="text-sm font-medium leading-snug text-qm-primary transition group-hover:text-white">
                    {p.q}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-qm-faint">
                    {p.sub}
                  </p>
                  <p className="mt-3 text-xs font-medium text-qm-positive group-hover:text-qm-positive-hover transition">
                    {t.journalPage.start}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline groups ── */}
      {groups.map(({ month, entries: groupEntries }) => (
        <section key={month}>

          {/* Month label */}
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-qm-faint ps-7">
            {month}
          </h2>

          {/* Timeline rail */}
          <div className="relative">
            <div
              className="absolute start-[7px] top-0 bottom-0 w-px"
              style={{ background: "rgba(184,195,219,0.09)" }}
              aria-hidden="true"
            />

            <div className="space-y-2.5">
              {groupEntries.map((entry) => {
                const ai = parseAI(entry.ai_response);
                const hasReflection = Boolean(ai);
                const domain = String(ai?.domain ?? "GENERAL").toUpperCase();
                const domainMeta = DOMAIN_META[domain] ?? DOMAIN_META.GENERAL!;
                const topEmotion: string = String(
                  ai?.emotions instanceof Array ? (ai.emotions[0] ?? "") : ""
                );
                const eColor = topEmotion ? emotionColor(topEmotion) : null;
                const title = entryTitle(
                  entry.title,
                  entry.content,
                  t.journal.untitledEntry
                );
                const isUntitled = !entry.title?.trim();

                return (
                  <div key={entry.id} className="relative flex gap-4 ps-7">

                    {/* Timeline dot */}
                    <div
                      className="absolute start-0 top-[18px] h-[15px] w-[15px] rounded-full border flex items-center justify-center shrink-0"
                      style={
                        hasReflection
                          ? {
                              background: "rgba(52,211,153,0.15)",
                              borderColor: "rgba(52,211,153,0.45)",
                            }
                          : {
                              background: "var(--qm-bg-card)",
                              borderColor: "rgba(184,195,219,0.18)",
                            }
                      }
                      aria-hidden="true"
                    >
                      {hasReflection && (
                        <span
                          className="h-[5px] w-[5px] rounded-full"
                          style={{ background: "#34d399" }}
                        />
                      )}
                    </div>

                    {/* Entry card */}
                    <Link
                      href={`/journal/${entry.id}`}
                      className="group flex-1 min-w-0 rounded-xl border border-qm-border-subtle bg-qm-bg p-4 hover:border-qm-border-card hover:bg-qm-elevated transition-all"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {hasReflection && (
                            <span className="shrink-0 text-sm leading-none" title={domain}>
                              {domainMeta.emoji}
                            </span>
                          )}
                          <span className="text-[11px] text-qm-faint tabular-nums">
                            {formatDay(entry.created_at, locale)}
                            <span className="mx-1 text-qm-faint">·</span>
                            {formatTime(entry.created_at)}
                          </span>
                        </div>

                        {hasReflection ? (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-qm-positive-border bg-qm-positive-soft px-2 py-0.5 text-[10px] font-medium text-qm-positive">
                            <span className="h-1 w-1 rounded-full bg-qm-positive" />
                            {t.journalPage.reflected}
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center rounded-full border border-qm-border-subtle bg-qm-elevated px-2 py-0.5 text-[10px] text-qm-faint">
                            {t.journalPage.draft}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p
                        className={`text-sm font-medium leading-snug transition group-hover:text-qm-primary ${
                          isUntitled ? "text-qm-muted italic" : "text-qm-primary"
                        }`}
                      >
                        {title}
                      </p>

                      {/* Content preview */}
                      <p className="mt-1 text-xs leading-relaxed text-qm-faint line-clamp-1">
                        {entry.content}
                      </p>

                      {/* Bottom row */}
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <div>
                          {topEmotion && eColor && (
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
                              style={{
                                color: eColor,
                                borderColor: `${eColor}30`,
                                backgroundColor: `${eColor}12`,
                              }}
                            >
                              {topEmotion}
                            </span>
                          )}
                        </div>
                        <span className="text-qm-positive text-xs group-hover:text-qm-positive-hover transition shrink-0">
                          {t.journalPage.open}
                        </span>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

    </div>
  );
}
