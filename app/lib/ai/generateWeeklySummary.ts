// app/lib/ai/generateWeeklySummary.ts
// Shared generation logic used by both the on-demand GET route and the weekly cron.
// Takes a userId + admin Supabase client, generates a summary, saves it to profiles.

import { SupabaseClient } from "@supabase/supabase-js";
import {
  bucketCorepattern,
  normalizeAIResponseSignals,
} from "@/lib/ai/normalizeInsightSignals";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GenerateResult =
  | { ok: true; summary: string; generatedAt: string }
  | { ok: false; reason: "no_data" | "groq_failed" | "db_error" };

// ── Groq call ─────────────────────────────────────────────────────────────────

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

    const data: any = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "").trim();
  } finally {
    clearTimeout(timer);
  }
}

// ── Prompt builder ────────────────────────────────────────────────────────────

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

function buildPrompt(opts: {
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
  const { entryCount, topThemes, topEmotions, topCorepatterns, topDomains,
    momentum, trendUp, trendDown, firstEntryDate } = opts;

  const since = firstEntryDate
    ? new Date(firstEntryDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "recently";

  const domainLabels = topDomains.slice(0, 3)
    .map((d) => DOMAIN_LABELS[d] ?? d.toLowerCase())
    .join(", ");

  const system = `You are Havenly, a calm and perceptive AI journaling companion.
Your job is to write a short, warm, personal summary of what you've noticed across a user's journal entries.

Rules:
- Write 2-3 short paragraphs. No more.
- Speak directly to the user ("you", "your") — warmly, not clinically.
- Be specific: name their actual emotions, themes, and what areas of life they write about most.
- Do NOT use therapy-speak, jargon, or prescriptive advice ("you should", "try to", "consider").
- Do NOT list bullet points or use headers.
- Sound like a thoughtful friend who has been quietly paying attention.
- The first paragraph should name what they write about most and what emotion sits underneath it.
- The second paragraph should name the pattern — what keeps showing up, and what it might mean.
- End with one quiet, open question — genuinely curious, not leading.
- Keep it under 200 words total.`;

  const parts: string[] = [`This person has written ${entryCount} journal entries since ${since}.`];
  if (domainLabels) parts.push(`The areas of life they write about most: ${domainLabels}.`);
  if (topEmotions.length) parts.push(`Emotions that appear most often: ${topEmotions.slice(0, 4).join(", ")}.`);
  if (topThemes.length) parts.push(`Recurring themes: ${topThemes.slice(0, 4).join(", ")}.`);
  if (topCorepatterns.length) {
    parts.push(`The core pattern Havenly detected most often: "${topCorepatterns[0]}".`);
    if (topCorepatterns[1]) parts.push(`Second most recurring: "${topCorepatterns[1]}".`);
  }
  if (trendUp.length) parts.push(`Emotions rising recently: ${trendUp.slice(0, 3).join(", ")}.`);
  if (trendDown.length) parts.push(`Emotions fading recently: ${trendDown.slice(0, 3).join(", ")}.`);
  if (momentum && momentum !== "Steady") parts.push(`Overall emotional momentum right now: ${momentum}.`);

  const user = parts.join("\n") +
    "\n\nWrite the summary now. Start with what you've noticed about them — not a greeting, not a preamble.";

  return { system, user };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateWeeklySummaryForUser(
  userId: string,
  adminClient: SupabaseClient
): Promise<GenerateResult> {
  // Fetch reflected entries
  const { data: rows } = await adminClient
    .from("journal_entries")
    .select("ai_response, created_at")
    .eq("user_id", userId)
    .not("ai_response", "is", null)
    .order("created_at", { ascending: false })
    .limit(2000);

  if (!rows?.length) return { ok: false, reason: "no_data" };

  // Signal extraction
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
    let parsed: any;
    try { parsed = typeof row.ai_response === "string" ? JSON.parse(row.ai_response) : row.ai_response; }
    catch { continue; }
    if (!parsed) continue;

    const normalized = normalizeAIResponseSignals(parsed);
    entryCount++;
    const created = row.created_at;
    if (!firstEntryDate || new Date(created) < new Date(firstEntryDate)) firstEntryDate = created;

    const age = now - new Date(created).getTime();
    const isRecent = age <= FOUR_WEEKS;
    const isOlder = age > FOUR_WEEKS && age <= FOUR_WEEKS * 2;

    if (normalized.domain) domains[normalized.domain] = (domains[normalized.domain] || 0) + 1;
    for (const t of normalized.themes) themes[t] = (themes[t] || 0) + 1;
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

  const sort = (r: Record<string, number>) =>
    Object.entries(r).sort((a, b) => b[1] - a[1]).map(([k]) => k);

  const topDomains = sort(domains).slice(0, 3);
  const topThemes = sort(themes).slice(0, 5);
  const topEmotions = sort(emotions).slice(0, 5);
  const topCorepatterns = sort(corepatterns).slice(0, 3);

  if (!topThemes.length && !topEmotions.length) return { ok: false, reason: "no_data" };

  const trendUp: string[] = [];
  const trendDown: string[] = [];
  for (const [e, rc] of Object.entries(recentEm)) {
    if (rc > (olderEm[e] ?? 0) + 1) trendUp.push(e);
  }
  for (const [e, oc] of Object.entries(olderEm)) {
    if (oc > (recentEm[e] ?? 0) + 1) trendDown.push(e);
  }

  const POSITIVE = new Set(["calm","hope","hopeful","joy","grateful","relief","excited",
    "contentment","clarity","motivated","open","curious","optimistic"]);
  const HEAVY = new Set(["dread","despair","hopeless","numb","exhaustion","overwhelm",
    "trapped","grief","shame","guilt","defeated","fear","anxiety"]);

  let pos = 0, hvy = 0;
  for (const [e, c] of Object.entries(recentEm)) {
    if (POSITIVE.has(e.toLowerCase())) pos += c;
    if (HEAVY.has(e.toLowerCase())) hvy += c;
  }

  let momentum = "Steady";
  if (pos > hvy + 2) momentum = "Lifting";
  else if (hvy > pos + 2) momentum = "Heavy";
  else if (trendUp.length > trendDown.length) momentum = "Shifting";
  else if (trendDown.length > trendUp.length) momentum = "Softening";

  // Generate summary
  const { system, user: userPrompt } = buildPrompt({
    entryCount, topThemes, topEmotions, topCorepatterns,
    topDomains, momentum, trendUp, trendDown, firstEntryDate,
  });

  let summary: string;
  try {
    summary = await callGroq(system, userPrompt);
  } catch (err) {
    console.error(`[weekly-summary] Groq failed for user ${userId}:`, err);
    return { ok: false, reason: "groq_failed" };
  }

  if (!summary || summary.length < 50) return { ok: false, reason: "groq_failed" };

  // Save to profiles
  const generatedAt = new Date().toISOString();
  const { error: saveErr } = await adminClient
    .from("profiles")
    .upsert(
      { id: userId, weekly_summary: summary, weekly_summary_generated_at: generatedAt },
      { onConflict: "id" }
    );

  if (saveErr) {
    console.error(`[weekly-summary] Save failed for user ${userId}:`, saveErr);
    return { ok: false, reason: "db_error" };
  }

  return { ok: true, summary, generatedAt };
}
