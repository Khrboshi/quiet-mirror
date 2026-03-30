// app/api/ai/weekly-summary/route.ts
import { NextResponse } from "next/server";
import { CONFIG } from "@/app/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { ensureCreditsFresh } from "@/lib/creditRules";
import {
  bucketCorepattern,
  normalizeAIResponseSignals,
} from "@/lib/ai/normalizeInsightSignals";
import {
  type PlanType,
  normalizePlan,
  type UserCreditsRow,
  type JournalAIRow,
  type ProfileSummaryRow,
  type GroqChatResponse,
  parseAIResponse,
} from "@/lib/planUtils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function callGroq(system: string, user: string): Promise<string> {
  const apiKey = process.env.GROQAPIKEY || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQAPIKEY");

  const model = process.env.GROQMODEL || "llama-3.3-70b-versatile";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 400,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Groq ${res.status}: ${text}`);
    }

    const data: GroqChatResponse = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

function buildSummaryPrompt(opts: {
  entryCount: number;
  topThemes: string[];
  topEmotions: string[];
  topCorepatterns: string[];
  topDomains: string[];
  momentum: string;
  trendUp: string[];
  trendDown: string[];
  firstEntryDate: string | null;
}): { system: string; user: string } {
  const {
    entryCount,
    topThemes,
    topEmotions,
    topCorepatterns,
    topDomains,
    momentum,
    trendUp,
    trendDown,
    firstEntryDate,
  } = opts;

  const since = firstEntryDate
    ? new Date(firstEntryDate).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : "recently";

  const DOMAIN_LABELS: Record<string, string> = {
    MONEY: "money and finances",
    WORK: "work and career",
    RELATIONSHIP: "relationships",
    HEALTH: "health and body",
    GRIEF: "grief and loss",
    PARENTING: "parenting",
    CREATIVE: "creativity and creative work",
    IDENTITY: "identity and self",
    FITNESS: "fitness and physical wellbeing",
  };

  const domainLabels = topDomains
    .slice(0, 3)
    .map((d) => DOMAIN_LABELS[d] ?? d.toLowerCase())
    .join(", ");

  const system = `You are ${CONFIG.aiPersonaName} — a private journaling companion that reflects back what it notices.
Write a short, personal summary of what has been showing up across this person's journal entries.

Rules:
- Write EXACTLY 3 short paragraphs separated by a blank line. No more, no fewer.
- Paragraph 1: What they write about most and the emotion that sits underneath it. 2-3 sentences.
- Paragraph 2: The recurring pattern — what keeps showing up and what it connects to. 2-3 sentences.
- Paragraph 3: ONE sentence only. A single quiet, open question. Nothing else. No preamble.
- Speak ONLY in second person — always "you" and "your". NEVER use "I", "I notice", "I sense", "I've noticed", "I wonder", "I've seen", "I'm curious", "As I read". You are a mirror, not a person.
- Do NOT list emotions or themes by name in a row — weave them into sentences that describe what they feel like together.
- Do NOT use therapy-speak, jargon, or prescriptive advice ("you should", "try to", "consider").
- Do NOT write bullet points or headers.
- Keep the whole summary under 180 words.
- BANNED phrases: "I notice", "I sense", "I can see", "I've noticed", "I've seen", "I'm curious", "Looking at your entries", "Based on your entries", "As I read", "It seems like", "I think", "I wonder", "emotions that surface include", "themes that appear", "recurring themes include"`;

  const parts: string[] = [`You have written ${entryCount} journal entries since ${since}.`];

  if (domainLabels) {
    parts.push(`The areas of life you write about most: ${domainLabels}.`);
  }
  if (topEmotions.length) {
    parts.push(`Emotions that appear most often: ${topEmotions.slice(0, 4).join(", ")}.`);
  }
  if (topThemes.length) {
    parts.push(`Recurring themes: ${topThemes.slice(0, 4).join(", ")}.`);
  }
  if (topCorepatterns.length) {
    parts.push(`The core pattern detected most often: "${topCorepatterns[0]}".`);
    if (topCorepatterns[1]) {
      parts.push(`Second most recurring: "${topCorepatterns[1]}".`);
    }
  }
  if (trendUp.length) {
    parts.push(`Emotions rising recently: ${trendUp.slice(0, 3).join(", ")}.`);
  }
  if (trendDown.length) {
    parts.push(`Emotions fading recently: ${trendDown.slice(0, 3).join(", ")}.`);
  }
  if (momentum && momentum !== "Steady") {
    parts.push(`Overall emotional momentum right now: ${momentum}.`);
  }

  const user =
    parts.join("\n") +
    "\n\nWrite exactly 3 paragraphs separated by blank lines. Second person only. Paragraph 3 is one question sentence, nothing else.";

  return { system, user };
}

export async function GET() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  await ensureCreditsFresh({ supabase, userId });
  const { data: credits } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle() as { data: UserCreditsRow | null; error: unknown };

  const plan = normalizePlan(credits?.plan_type);
  if (plan !== "PREMIUM" && plan !== "TRIAL") {
    return NextResponse.json({ error: "Premium required" }, { status: 402 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("weekly_summary, weekly_summary_generated_at")
    .eq("id", userId)
    .maybeSingle() as { data: ProfileSummaryRow | null; error: unknown };

  const cachedSummary = profile?.weekly_summary ?? null;
  const cachedAt = profile?.weekly_summary_generated_at ?? null;

  const isFresh =
    cachedSummary &&
    cachedAt &&
    Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return NextResponse.json(
      { summary: cachedSummary, generatedAt: cachedAt, cached: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const { data: rows } = await supabase
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(2000) as { data: JournalAIRow[] | null; error: unknown };

  if (!rows?.length) {
    return NextResponse.json({ error: "Not enough data yet." }, { status: 422 });
  }

  const themes: Record<string, number> = {};
  const emotions: Record<string, number> = {};
  const corepatterns: Record<string, number> = {};
  const domains: Record<string, number> = {};

  const now = Date.now();
  const FOUR_WEEKS = 28 * 24 * 60 * 60 * 1000;
  const recentEm: Record<string, number> = {};
  const olderEm: Record<string, number> = {};
  let firstEntryDate: string | null = null;
  let entryCount = 0;

  for (const row of rows) {
    const parsed = parseAIResponse(row.ai_response);
    if (!parsed) continue;

    const normalized = normalizeAIResponseSignals(parsed);

    entryCount++;
    const created = row.created_at;
    if (!created) continue;
    if (!firstEntryDate || new Date(created) < new Date(firstEntryDate)) {
      firstEntryDate = created;
    }

    const age = now - new Date(created).getTime();
    const isRecent = age <= FOUR_WEEKS;
    const isOlder = age > FOUR_WEEKS && age <= FOUR_WEEKS * 2;

    if (normalized.domain) {
      domains[normalized.domain] = (domains[normalized.domain] || 0) + 1;
    }

    for (const t of normalized.themes) {
      themes[t] = (themes[t] || 0) + 1;
    }

    for (const e of normalized.emotions) {
      emotions[e] = (emotions[e] || 0) + 1;
      if (isRecent) recentEm[e] = (recentEm[e] || 0) + 1;
      if (isOlder) olderEm[e] = (olderEm[e] || 0) + 1;
    }

    if (normalized.corepattern) {
      const bucketed = bucketCorepattern(normalized.corepattern);
      corepatterns[bucketed] = (corepatterns[bucketed] || 0) + 1;
    }
  }

  const topDomains = Object.entries(domains)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const topThemes = Object.entries(themes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const topEmotions = Object.entries(emotions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);

  const topCorepatterns = Object.entries(corepatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  const trendUp: string[] = [];
  const trendDown: string[] = [];

  for (const [e, rc] of Object.entries(recentEm)) {
    if (rc > (olderEm[e] ?? 0) + 1) trendUp.push(e);
  }
  for (const [e, oc] of Object.entries(olderEm)) {
    if (oc > (recentEm[e] ?? 0) + 1) trendDown.push(e);
  }

  const POSITIVE = new Set([
    "calm",
    "hope",
    "hopeful",
    "joy",
    "grateful",
    "relief",
    "excited",
    "contentment",
    "clarity",
    "motivated",
    "open",
    "curious",
    "optimistic",
  ]);

  const HEAVY = new Set([
    "dread",
    "despair",
    "hopeless",
    "numb",
    "exhaustion",
    "overwhelm",
    "trapped",
    "grief",
    "shame",
    "guilt",
    "defeated",
    "fear",
    "anxiety",
  ]);

  let pos = 0;
  let hvy = 0;

  for (const [e, c] of Object.entries(recentEm)) {
    if (POSITIVE.has(e.toLowerCase())) pos += c;
    if (HEAVY.has(e.toLowerCase())) hvy += c;
  }

  let momentum = "Steady";
  if (pos > hvy + 2) momentum = "Lifting";
  else if (hvy > pos + 2) momentum = "Heavy";
  else if (trendUp.length > trendDown.length) momentum = "Shifting";
  else if (trendDown.length > trendUp.length) momentum = "Softening";

  if (!topThemes.length && !topEmotions.length) {
    return NextResponse.json(
      { error: "Not enough personal data yet. Keep writing and generating reflections." },
      { status: 422 }
    );
  }

  const { system, user: userPrompt } = buildSummaryPrompt({
    entryCount,
    topThemes,
    topEmotions,
    topCorepatterns,
    topDomains,
    momentum,
    trendUp,
    trendDown,
    firstEntryDate,
  });

  let summary: string;
  try {
    summary = await callGroq(system, userPrompt);
  } catch (err) {
    console.error("[weekly-summary] Groq failed:", err);
    return NextResponse.json(
      { error: "Summary generation failed. Try again in a moment." },
      { status: 500 }
    );
  }

  if (!summary || summary.length < 50) {
    return NextResponse.json(
      { error: "Summary generation failed. Try again in a moment." },
      { status: 500 }
    );
  }

  // Strip first-person "I" constructions regardless of what the model produced
  summary = summary
    .replace(/As I read through your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve been reading your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve been looking at your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve gone through your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve reviewed your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve read your entries,?\s*/gi, "Across your entries, ")
    .replace(/I'?ve noticed that\s+/gi, "There's a pattern here: ")
    .replace(/I'?ve noticed\s+/gi, "")
    .replace(/I'?ve seen that\s+/gi, "")
    .replace(/I'?ve seen\s+/gi, "")
    .replace(/I notice that\s+/gi, "")
    .replace(/I notice\s+/gi, "")
    .replace(/I'?m curious\s*[—–-]\s*/gi, "")
    .replace(/I'?m curious\s+/gi, "")
    .replace(/I sense a\s+/gi, "There's a ")
    .replace(/I sense\s+/gi, "There's a sense of ")
    .replace(/I can see that\s+/gi, "")
    .replace(/I can see\s+/gi, "")
    .replace(/I see that\s+/gi, "")
    .replace(/I see a\s+/gi, "There's a ")
    .replace(/I'?d also note\s+/gi, "Worth noting: ")
    .replace(/I'?d note\s+/gi, "Worth noting: ")
    .replace(/I wonder\s*[—–-]\s*/gi, "")
    .replace(/I wonder\s+/gi, "")
    .replace(/I think that\s+/gi, "")
    .replace(/I think\s+/gi, "")
    .replace(/I'?m also noticing\s+/gi, "")
    .replace(/I'?m noticing\s+/gi, "")
    .replace(/(here:|noted:|pattern:|noting:)\s+([a-z])/g, (_, label, ch) => `${label} ${ch.toUpperCase()}`)
    .replace(/\s{2,}/g, " ")
    .trim();

  // Enforce paragraph breaks — if model collapsed to one block, try to split
  // at natural sentence boundaries to restore 3-paragraph structure
  if (!summary.includes("\n\n")) {
    const sentences = summary.match(/[^.!?]+[.!?]+/g) ?? [summary];
    if (sentences.length >= 3) {
      const third = Math.ceil(sentences.length * 0.45);
      const twoThird = Math.ceil(sentences.length * 0.85);
      const p1 = sentences.slice(0, third).join(" ").trim();
      const p2 = sentences.slice(third, twoThird).join(" ").trim();
      const p3 = sentences.slice(twoThird).join(" ").trim();
      if (p1 && p2 && p3) summary = `${p1}\n\n${p2}\n\n${p3}`;
      else if (p1 && p2) summary = `${p1}\n\n${p2}`;
    }
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const generatedAt = new Date().toISOString();
  await adminClient
    .from("profiles")
    .upsert(
      { id: userId, weekly_summary: summary, weekly_summary_generated_at: generatedAt },
      { onConflict: "id" }
    );

  return NextResponse.json(
    { summary, generatedAt, cached: false },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const supabase = createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await adminClient
    .from("profiles")
    .upsert(
      {
        id: user.id,
        weekly_summary: null,
        weekly_summary_generated_at: null,
      },
      { onConflict: "id" }
    );

  return new Response(null, { status: 204 });
}
