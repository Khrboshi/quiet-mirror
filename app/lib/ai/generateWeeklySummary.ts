/**
 * app/lib/ai/generateWeeklySummary.ts
 *
 * Shared weekly summary generation logic used by two callers:
 *   - GET  /api/ai/weekly-summary  — on-demand per-user generation
 *   - POST /api/cron/weekly-summaries — batch cron for all Premium users
 *
 * Reads the user's last 30 days of journal entries with reflections,
 * builds a prompt with their top themes/emotions/patterns, calls Groq,
 * and persists the result to profiles.weekly_summary.
 *
 * The caller is responsible for passing a service-role Supabase client
 * (required to write profiles rows bypassing RLS).
 */
import { SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "@/app/lib/config";
import { getGroqConfig } from "@/app/lib/ai/groq";
import { getAiLanguageName } from "@/app/lib/i18n";
import {
  bucketCorepattern,
  normalizeAIResponseSignals,
} from "@/lib/ai/normalizeInsightSignals";
import { type GroqChatResponse, parseAIResponse } from "@/lib/planUtils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GenerateResult =
  | { ok: true; summary: string; generatedAt: string }
  | { ok: false; reason: "no_data" | "groq_failed" | "db_error" };

// ── Groq call ─────────────────────────────────────────────────────────────────

async function callGroq(system: string, user: string): Promise<string> {
  const { apiKey, model } = getGroqConfig();
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
  locale?: string;
}): { system: string; user: string } {
  const { entryCount, topThemes, topEmotions, topCorepatterns, topDomains,
    momentum, trendUp, trendDown, firstEntryDate, locale = "en" } = opts;

  const targetLanguage = getAiLanguageName(locale);
  const languageInstruction = targetLanguage
    ? `\nLANGUAGE: Respond entirely in ${targetLanguage}. Every sentence must be in ${targetLanguage}. Do not use English anywhere in your response.\n`
    : "";

  const since = firstEntryDate
    ? new Date(firstEntryDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "recently";

  const domainLabels = topDomains.slice(0, 3)
    .map((d) => DOMAIN_LABELS[d] ?? d.toLowerCase())
    .join(", ");

  const system = `You are ${CONFIG.aiPersonaName} — a private journaling companion that reflects back what it notices.
Write a short, personal summary of what has been showing up across this person's journal entries.
${languageInstruction}
Rules:
- Write EXACTLY 3 short paragraphs separated by a blank line. No more, no fewer.
- Paragraph 1: What they write about most and the emotion that sits underneath it. 2-3 sentences.
- Paragraph 2: The recurring pattern — what keeps showing up and what it connects to. 2-3 sentences.
- Paragraph 3: ONE sentence only. A single quiet, open question. Nothing else.
- Speak ONLY in second person — always "you" and "your". NEVER use "I", "I notice", "I sense", "I wonder", "I can see". You are a mirror, not a person.
- Do NOT list emotions or themes by name in a row — weave them into sentences that describe what they feel like together.
- Do NOT use therapy-speak, jargon, or prescriptive advice ("you should", "try to", "consider").
- Do NOT list bullet points or use headers.
- Keep the whole summary under 180 words.
- BANNED phrases: "I notice", "I sense", "I can see", "I've noticed", "I wonder", "Looking at your entries", "Based on your entries", "It seems like", "It appears that", "emotions that surface include", "themes that appear", "recurring themes include"`;

  const parts: string[] = [`You have written ${entryCount} journal entries since ${since}.`];
  if (domainLabels) parts.push(`The areas of life you write about most: ${domainLabels}.`);
  if (topEmotions.length) parts.push(`Emotions that appear most often: ${topEmotions.slice(0, 4).join(", ")}.`);
  if (topThemes.length) parts.push(`Recurring themes: ${topThemes.slice(0, 4).join(", ")}.`);
  if (topCorepatterns.length) {
    parts.push(`The core pattern detected most often: "${topCorepatterns[0]}".`);
    if (topCorepatterns[1]) parts.push(`Second most recurring: "${topCorepatterns[1]}".`);
  }
  if (trendUp.length) parts.push(`Emotions rising recently: ${trendUp.slice(0, 3).join(", ")}.`);
  if (trendDown.length) parts.push(`Emotions fading recently: ${trendDown.slice(0, 3).join(", ")}.`);
  if (momentum && momentum !== "Steady") parts.push(`Overall emotional momentum right now: ${momentum}.`);

  const user = parts.join("\n") +
    "\n\nWrite exactly 3 paragraphs separated by blank lines. Second person only. Paragraph 3 is one question sentence, nothing else.";

  return { system, user };
}

// ── Voice sanitizer ───────────────────────────────────────────────────────────
// Programmatically removes first-person "I" constructions that the model
// produces despite prompt instructions. Runs after every generation.

function sanitizeSummaryVoice(text: string): string {
  return text
    // "As I read through / As I've been reading your entries..." → "Across your entries..."
    .replace(/As I read through your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve been reading your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve been looking at your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve gone through your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve reviewed your entries,?\s*/gi, "Across your entries, ")
    .replace(/As I'?ve read your entries,?\s*/gi, "Across your entries, ")
    // "I've noticed that..." → "There's a pattern here:"
    .replace(/I'?ve noticed that\s+/gi, "There's a pattern here: ")
    .replace(/I'?ve noticed\s+/gi, "")
    // "I've seen..." → remove
    .replace(/I'?ve seen that\s+/gi, "")
    .replace(/I'?ve seen\s+/gi, "")
    // "I notice..." → remove the phrase
    .replace(/I notice that\s+/gi, "")
    .replace(/I notice\s+/gi, "")
    // "I'm curious..." → "What..."
    .replace(/I'?m curious\s*[—–-]\s*/gi, "")
    .replace(/I'?m curious\s+/gi, "")
    // "I sense a..." → "There's a..."
    .replace(/I sense a\s+/gi, "There's a ")
    .replace(/I sense\s+/gi, "There's a sense of ")
    // "I can see..." → remove
    .replace(/I can see that\s+/gi, "")
    .replace(/I can see\s+/gi, "")
    // "I see..." → remove
    .replace(/I see that\s+/gi, "")
    .replace(/I see a\s+/gi, "There's a ")
    // "I'd also note..." → "Worth noting..."
    .replace(/I'?d also note\s+/gi, "Worth noting: ")
    .replace(/I'?d note\s+/gi, "Worth noting: ")
    // "I wonder..." → remove the leading phrase, keep the question
    .replace(/I wonder\s*[—–-]\s*/gi, "")
    .replace(/I wonder\s+/gi, "")
    // "I think..." → remove
    .replace(/I think that\s+/gi, "")
    .replace(/I think\s+/gi, "")
    // "I'm also noticing..." → remove
    .replace(/I'?m also noticing\s+/gi, "")
    .replace(/I'?m noticing\s+/gi, "")
    // "It's like I'm seeing..." → remove
    .replace(/It'?s like I'?m seeing\s+/gi, "")
    // Fix sentence capitalisation after removals (e.g. "here: comparison" → "here: Comparison")
    .replace(/(here:|noted:|pattern:|noting:)\s+([a-z])/g, (_, label, ch) => `${label} ${ch.toUpperCase()}`)
    // Clean up any double spaces left behind
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateWeeklySummaryForUser(
  userId: string,
  adminClient: SupabaseClient,
  locale: string = "en"
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
    const parsed = parseAIResponse(
      row.ai_response as string | Record<string, unknown> | null
    );
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
    locale,
  });

  let summary: string;
  try {
    summary = await callGroq(system, userPrompt);
  } catch (err) {
    console.error(`[weekly-summary] Groq failed for user ${userId}:`, err);
    return { ok: false, reason: "groq_failed" };
  }

  if (!summary || summary.length < 50) return { ok: false, reason: "groq_failed" };

  // Post-process: strip first-person "I" constructions the model keeps generating
  // despite prompt instructions. These replacements run on every summary before
  // it's saved or shown to the user.
  summary = sanitizeSummaryVoice(summary);

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
