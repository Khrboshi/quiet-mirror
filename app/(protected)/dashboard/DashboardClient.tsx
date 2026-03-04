// app/(protected)/dashboard/DashboardClient.tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/components/SupabaseSessionProvider";
import { useUserPlan } from "@/app/components/useUserPlan";
import type { DashboardData } from "./page";

// ── Helpers ───────────────────────────────────────────────────────────────────

function titleOrUntitled(title: string | null) {
  return title?.trim() ? title.trim() : "Untitled entry";
}

function friendlyNameFromUser(user: any): string | null {
  const md = user?.user_metadata ?? {};
  const raw = [md.full_name, md.name, md.display_name, md.username,
    user?.email ? String(user.email).split("@")[0] : null]
    .filter(Boolean).map(String)[0] ?? "";
  const clean = raw.trim().replace(/\s+/g, " ").slice(0, 24);
  return clean || null;
}

function buildHref(prompt: string) {
  return `/journal/new?prompt=${encodeURIComponent(prompt)}`;
}

function greetingByHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function friendlyDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isoDate = (x: Date) => x.toISOString().slice(0, 10);
  if (isoDate(d) === isoDate(today)) return "today";
  if (isoDate(d) === isoDate(yesterday)) return "yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function startOfNextMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1)
    .toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Rotate prompts deterministically by day of week — feels fresh but not random
const PROMPT_POOL = [
  { q: "How is your body feeling right now?", sub: "Tension, calm, tired, restless — anything you notice." },
  { q: "What is one thing occupying your mind?", sub: "One sentence is enough." },
  { q: "What are you avoiding thinking about?", sub: "You don't have to solve it — just name it." },
  { q: "What do you need more of right now?", sub: "Rest, space, connection, clarity — anything." },
  { q: "What felt heavy this week?", sub: "No need to explain why." },
  { q: "What are you proud of, even quietly?", sub: "Small things count." },
  { q: "Just free write", sub: "No structure. No rules. Start anywhere." },
];

function getDailyPrompts(): typeof PROMPT_POOL {
  const day = new Date().getDay(); // 0–6
  const start = day % PROMPT_POOL.length;
  return [
    PROMPT_POOL[start % PROMPT_POOL.length],
    PROMPT_POOL[(start + 1) % PROMPT_POOL.length],
    PROMPT_POOL[(start + 2) % PROMPT_POOL.length],
  ];
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
      <span className="text-base leading-none">🔥</span>
      {streak} day{streak !== 1 ? "s" : ""} in a row
    </span>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm">
      {label}: <span className="text-slate-200">{value}</span>
    </span>
  );
}

// ── Personalised insight card (Premium) ───────────────────────────────────────

function PremiumInsightCard({
  emotion,
  theme,
  corepattern,
  reflectedThisWeek,
}: {
  emotion: string | null;
  theme: string | null;
  corepattern: string | null;
  reflectedThisWeek: boolean;
}) {
  const hasData = emotion || theme || corepattern;
  if (!hasData) return null;

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-transparent p-6">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-emerald-500/70">
        Your pattern right now
      </p>

      {corepattern ? (
        <p className="text-base font-medium leading-relaxed text-slate-100">
          "{corepattern}"
        </p>
      ) : (
        <p className="text-base font-medium leading-relaxed text-slate-100">
          {emotion && theme
            ? `${emotion} keeps showing up — often alongside themes of ${theme.toLowerCase()}.`
            : emotion
            ? `${emotion} has been your most present emotion recently.`
            : `${theme} is the theme that's been appearing most in your entries.`}
        </p>
      )}

      {(emotion || theme) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {emotion && (
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300">
              {emotion}
            </span>
          )}
          {theme && (
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-300">
              {theme}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <Link
          href="/insights"
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
        >
          See full insights →
        </Link>
        {!reflectedThisWeek && (
          <span className="text-xs text-slate-600">·</span>
        )}
        {!reflectedThisWeek && (
          <Link
            href="/journal"
            className="text-xs text-slate-500 hover:text-slate-400 transition"
          >
            Reflect on a recent entry
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Upgrade teaser card (Free) ────────────────────────────────────────────────

function FreeInsightTeaser({
  entryCount,
  emotion,
  theme,
}: {
  entryCount: number;
  emotion: string | null;
  theme: string | null;
}) {
  const hasHint = emotion || theme;

  if (entryCount < 3) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          Your patterns
        </p>
        <p className="text-sm text-slate-400">
          Write <span className="text-slate-200">{3 - entryCount} more {3 - entryCount === 1 ? "entry" : "entries"}</span> and
          Havenly will start noticing what quietly repeats across your writing.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">
        A pattern is forming
      </p>

      {hasHint ? (
        <p className="text-sm text-slate-300 leading-relaxed">
          Across your entries, there may be a recurring thread around{" "}
          <span className="blur-[5px] select-none rounded bg-white/10 px-1 text-white">
            {emotion ?? theme}
          </span>
          . Premium helps you see it clearly.
        </p>
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed">
          Havenly has noticed a recurring thread in your entries.
          Premium helps you see what quietly repeats.
        </p>
      )}

      <Link
        href="/upgrade"
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition"
      >
        Unlock insights →
      </Link>
    </div>
  );
}

// ── Thread card ───────────────────────────────────────────────────────────────

function ThreadCard({
  lastEntryId,
  lastEntryTitle,
  lastEntryDate,
  lastTopEmotion,
  wroteToday,
}: {
  lastEntryId: string | null;
  lastEntryTitle: string | null;
  lastEntryDate: string | null;
  lastTopEmotion: string | null;
  wroteToday: boolean;
}) {
  const when = lastEntryDate ? friendlyDate(lastEntryDate) : null;
  const title = titleOrUntitled(lastEntryTitle);

  const headline = wroteToday
    ? "You wrote today"
    : lastEntryId
    ? "Pick up the thread"
    : "Begin your story";

  const body = wroteToday
    ? `You checked in today — "${title}". How has the day evolved?`
    : lastEntryId && lastTopEmotion
    ? `You wrote ${when} — "${title}". ${lastTopEmotion} was present. Has anything shifted?`
    : lastEntryId
    ? `You wrote ${when} — "${title}". Has anything softened since?`
    : "One honest sentence is always enough to start.";

  const threadPrompt = wroteToday
    ? `You wrote today — "${title}". How has the day evolved?`
    : lastTopEmotion
    ? `You wrote ${when} about "${title}". ${lastTopEmotion} was present. Has anything shifted?`
    : `Following up on "${title}" — has anything softened since you wrote?`;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{headline}</p>
      <p className="mt-2 text-sm font-medium text-slate-100 leading-snug">{body}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildHref(threadPrompt)}
          className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 transition"
        >
          {wroteToday ? "Add to today" : "Update today"}
        </Link>

        {lastEntryId && (
          <Link
            href={`/journal/${lastEntryId}`}
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
          >
            Open last entry
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardClient({ data }: { data: DashboardData }) {
  const { supabase } = useSupabase();
  const { planType, credits, loading: planLoading } = useUserPlan();

  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: d }) => {
      setDisplayName(friendlyNameFromUser(d?.user));
    });
  }, [supabase]);

  const isPremium = planType === "PREMIUM" || planType === "TRIAL";
  const isFree = !planLoading && planType === "FREE";
  const isUnlimited = isPremium;
  const reflectionsPaused = isFree && (credits ?? 0) === 0;
  const resetLabel = startOfNextMonth();
  const readablePlan = isPremium ? (planType === "TRIAL" ? "Trial" : "Premium") : "Free";

  const greeting = displayName
    ? `${greetingByHour()}, ${displayName}`
    : greetingByHour();

  const prompts = useMemo(() => getDailyPrompts(), []);

  const {
    entryCount, streak, lastEntryId, lastEntryTitle, lastEntryDate,
    lastEntryHasReflection, lastTopEmotion, lastTopTheme, lastCorepattern,
    wroteToday, reflectedThisWeek,
  } = data;

  // Entries this week (best effort from what server passed)
  const subline = useMemo(() => {
    if (entryCount === 0) return "Start writing — one sentence is always enough.";
    if (wroteToday) return "You've checked in today. Keep going.";
    return "Choose a prompt to begin.";
  }, [entryCount, wroteToday]);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-10 pb-20 text-slate-200">

      {/* ── Header ── */}
      <div className="mb-8 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {greeting}
            </h1>
            <p className="text-sm text-slate-400">{subline}</p>
          </div>

          {streak >= 2 && <StreakBadge streak={streak} />}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-slate-400">
          <StatPill label="Plan" value={readablePlan} />

          {isUnlimited ? (
            <StatPill label="Reflections" value="unlimited" />
          ) : reflectionsPaused ? (
            <StatPill label="Reflections" value={`paused · returns ${resetLabel}`} />
          ) : (
            <StatPill label="Reflections" value={planLoading ? "…" : String(credits ?? 0)} />
          )}

          {entryCount > 0 && (
            <StatPill label="Entries" value={String(entryCount)} />
          )}
        </div>

        {reflectionsPaused && (
          <p className="text-xs text-slate-600">
            You can always write freely — reflections return {resetLabel}.
          </p>
        )}
      </div>

      {/* ── Premium insight card / Free teaser ── */}
      {isPremium && (lastTopEmotion || lastTopTheme || lastCorepattern) && (
        <div className="mb-8">
          <PremiumInsightCard
            emotion={lastTopEmotion}
            theme={lastTopTheme}
            corepattern={lastCorepattern}
            reflectedThisWeek={reflectedThisWeek}
          />
        </div>
      )}

      {isFree && entryCount >= 2 && (
        <div className="mb-8">
          <FreeInsightTeaser
            entryCount={entryCount}
            emotion={lastTopEmotion}
            theme={lastTopTheme}
          />
        </div>
      )}

      {/* ── Daily prompts ── */}
      <div className="mb-6">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Today's prompts
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {prompts.map((c) => (
            <Link
              key={c.q}
              href={buildHref(c.q)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] hover:border-white/20 transition"
            >
              <p className="font-medium text-slate-100 leading-snug group-hover:text-white transition">
                {c.q}
              </p>
              <p className="mt-1.5 text-sm text-slate-500">{c.sub}</p>
              <p className="mt-3 text-xs font-medium text-emerald-400 group-hover:text-emerald-300 transition">
                Start →
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Thread + stats row ── */}
      <div className="grid gap-4 sm:grid-cols-2">

        <ThreadCard
          lastEntryId={lastEntryId}
          lastEntryTitle={lastEntryTitle}
          lastEntryDate={lastEntryDate}
          lastTopEmotion={lastTopEmotion}
          wroteToday={wroteToday}
        />

        {/* Stats / history card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Your history</p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total entries</span>
              <span className="font-medium text-slate-100">{entryCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Current streak</span>
              <span className="font-medium text-slate-100">
                {streak > 0 ? `${streak} day${streak !== 1 ? "s" : ""}` : "Start today"}
              </span>
            </div>
            {lastEntryDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Last entry</span>
                <span className="font-medium text-slate-100">{friendlyDate(lastEntryDate)}</span>
              </div>
            )}
            {isPremium && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Reflections</span>
                <span className="font-medium text-emerald-400">Unlimited</span>
              </div>
            )}
          </div>

          <div className="pt-1 border-t border-white/5 flex flex-wrap gap-2">
            <Link
              href="/journal"
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              All entries →
            </Link>
            {isPremium && (
              <Link
                href="/insights"
                className="text-xs text-emerald-500/70 hover:text-emerald-400 transition"
              >
                View insights →
              </Link>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
