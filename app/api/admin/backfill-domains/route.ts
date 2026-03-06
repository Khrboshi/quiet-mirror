// app/api/admin/backfill-domains/route.ts
// ONE-TIME USE — delete this file after running it once.
// Hit GET /api/admin/backfill-domains?key=YOUR_CREDITS_ADMIN_KEY to backfill.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Inline domain detection (copied from generateReflection.ts) ───────────────

type Domain =
  | "WORK" | "RELATIONSHIP" | "FITNESS" | "MONEY"
  | "HEALTH" | "GRIEF" | "PARENTING" | "CREATIVE"
  | "IDENTITY" | "GENERAL";

type WeightedSignal = { re: RegExp; w: number };

const DOMAIN_SIGNALS: Record<Domain, WeightedSignal[]> = {
  FITNESS: [
    { re: /\b(ran|run|running|jog(ged)?|sprint(ed)?)\b/i, w: 2 },
    { re: /\b(workout|training|exercise|gym|lifting|cardio)\b/i, w: 3 },
    { re: /\b(miles|pace|reps|sets|pb|personal best|race|marathon)\b/i, w: 3 },
    { re: /\b(body|weight|fitness|physical|muscles?|strength)\b/i, w: 1 },
  ],
  MONEY: [
    { re: /\b(bank statements?|bank account|can't make rent|can't afford rent|can't pay)\b/i, w: 5 },
    { re: /\b(money|finances?|budget|debt|savings?|bills?|rent|mortgage)\b/i, w: 3 },
    { re: /\b(afford|expensive|broke|salary|income|spending|overdraft|loan)\b/i, w: 2 },
    { re: /\b(financial|bank|credit card|paycheck|cost of living)\b/i, w: 2 },
  ],
  WORK: [
    { re: /\b(job|work|boss|manager|colleague|office|meeting|project)\b/i, w: 2 },
    { re: /\b(career|promotion|fired|quit|resign|interview|deadline)\b/i, w: 3 },
    { re: /\b(client|team|workplace|professional|employee|hired)\b/i, w: 2 },
  ],
  RELATIONSHIP: [
    { re: /\b(partner|husband|wife|boyfriend|girlfriend|spouse)\b/i, w: 3 },
    { re: /\b(relationship|marriage|divorce|breakup|dating|love)\b/i, w: 3 },
    { re: /\b(fight|argument|conflict|trust|jealous|cheating)\b/i, w: 2 },
    { re: /\b(friend|friendship|family|sister|brother|mother|father|parents?)\b/i, w: 1 },
  ],
  HEALTH: [
    { re: /\b(doctor|hospital|diagnosis|test results?|appointment|medical)\b/i, w: 4 },
    { re: /\b(pain|sick|illness|disease|symptom|treatment|medication)\b/i, w: 3 },
    { re: /\b(health|body|mental health|therapy|therapist|anxiety disorder)\b/i, w: 2 },
    { re: /\b(scared|fear|worried) about (my )?(health|body|diagnosis)\b/i, w: 4 },
  ],
  GRIEF: [
    { re: /\b(died|death|passed away|funeral|grief|mourning|loss)\b/i, w: 5 },
    { re: /\b(miss(ing)?|gone|no longer here|remember(ing)?)\b/i, w: 2 },
    { re: /\b(anniversary|memorial|grave|ashes|buried)\b/i, w: 3 },
  ],
  PARENTING: [
    { re: /\b(son|daughter|kid|child|children|baby|toddler)\b/i, w: 3 },
    { re: /\b(parent(ing)?|mom|dad|mother|father|school|pickup)\b/i, w: 2 },
    { re: /\b(yelled at|snapped at|lost it with) (my )?(son|daughter|kid|child)\b/i, w: 5 },
  ],
  CREATIVE: [
    { re: /\b(writing|wrote|novel|story|poem|art|painting|drawing)\b/i, w: 3 },
    { re: /\b(creative|creativity|blank page|block|draft|publish|create)\b/i, w: 3 },
    { re: /\b(music|song|compose|design|photography|film|project)\b/i, w: 2 },
  ],
  IDENTITY: [
    { re: /\b(who (am|I am)|identity|self|purpose|meaning|values?)\b/i, w: 3 },
    { re: /\b(lost|don't know (who|what)|performing|pretending|mask|facade)\b/i, w: 3 },
    { re: /\b(authentic|real (me|self)|underneath|belong|invisible)\b/i, w: 2 },
  ],
  GENERAL: [],
};

function scoreDomain(text: string): Record<Domain, number> {
  const scores: Record<Domain, number> = {
    FITNESS: 0, MONEY: 0, WORK: 0, RELATIONSHIP: 0,
    HEALTH: 0, GRIEF: 0, PARENTING: 0, CREATIVE: 0,
    IDENTITY: 0, GENERAL: 0,
  };
  for (const [domain, signals] of Object.entries(DOMAIN_SIGNALS) as [Domain, WeightedSignal[]][]) {
    for (const { re, w } of signals) {
      if (re.test(text)) scores[domain] += w;
    }
  }
  return scores;
}

function detectDomain(text: string): Domain {
  const scores = scoreDomain(text);
  const sorted = (Object.entries(scores) as [Domain, number][])
    .filter(([d]) => d !== "GENERAL")
    .sort(([, a], [, b]) => b - a);
  const [top, second] = sorted;
  if (!top || top[1] <= 0) return "GENERAL";
  const secondScore = second?.[1] ?? 0;
  const margin = top[1] - secondScore;
  if (top[1] < 2 && margin <= 0) return "GENERAL";
  if (margin >= 2) return top[0];
  return top[0];
}

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  // One-time backfill — no auth needed, delete this file after use

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all entries that have ai_response but no domain field set
  const { data: rows, error } = await supabase
    .from("journal_entries")
    .select("id, content, ai_response")
    .not("ai_response", "is", null)
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  let skipped = 0;
  const domainCounts: Record<string, number> = {};

  for (const row of rows ?? []) {
    let parsed: any = null;
    try {
      parsed = typeof row.ai_response === "string"
        ? JSON.parse(row.ai_response)
        : row.ai_response;
    } catch {
      skipped++;
      continue;
    }

    // Skip if domain already set
    if (parsed?.domain && parsed.domain !== "GENERAL") {
      domainCounts[parsed.domain] = (domainCounts[parsed.domain] || 0) + 1;
      skipped++;
      continue;
    }

    // Detect domain from entry content
    const domain = detectDomain(row.content ?? "");
    parsed.domain = domain;
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;

    // Write back
    const { error: updateErr } = await supabase
      .from("journal_entries")
      .update({ ai_response: parsed })
      .eq("id", row.id);

    if (!updateErr) updated++;
    else skipped++;
  }

  return NextResponse.json({
    message: `Backfill complete`,
    updated,
    skipped,
    total: rows?.length ?? 0,
    domainDistribution: domainCounts,
  });
}
