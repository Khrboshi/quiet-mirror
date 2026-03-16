// app/api/cron/weekly-summaries/route.ts
//
// Automatically generates weekly summaries for all Premium users whose
// summary is stale (older than 6 days or never generated).
//
// Triggered by GitHub Actions every Monday at 09:00 UTC — free, no Vercel Pro needed.
// GitHub Actions sends: GET /api/cron/weekly-summaries
//                       Authorization: Bearer <CRON_SECRET>
//
// REQUIREMENTS:
// - CRON_SECRET env var in Vercel dashboard (any strong random string)
// - CRON_SECRET secret in GitHub repo (same value)
// - SUPABASE_SERVICE_ROLE_KEY env var (already configured)
//
// On Vercel Hobby the function timeout is 10 seconds.
// Each user takes ~3-5s (DB query + Groq call + save).
// MAX_USERS_PER_RUN = 3 keeps us safely within the 10s limit at pre-launch scale.
// Raise this when you upgrade to Vercel Pro.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateWeeklySummaryForUser } from "@/app/lib/ai/generateWeeklySummary";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // Vercel Hobby ignores this (hard 10s cap), Pro honours it

// Summaries older than 6 days are considered stale (7-day TTL with 1 day buffer)
const STALE_THRESHOLD_MS = 6 * 24 * 60 * 60 * 1000;

// Safe for Vercel Hobby: 3 users × ~3s each ≈ 9s — just within the 10s limit.
// Raise to 20+ when on Vercel Pro.
const MAX_USERS_PER_RUN = 3;

export async function GET(req: Request) {
  // ── Verify this is a legitimate Vercel cron call ──────────────────────────
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[cron/weekly-summaries] CRON_SECRET env var is not set");
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Admin Supabase client (bypasses RLS) ──────────────────────────────────
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ── Find all Premium / Trial users ───────────────────────────────────────
  const { data: premiumUsers, error: usersErr } = await adminClient
    .from("user_credits")
    .select("user_id")
    .in("plan_type", ["PREMIUM", "TRIAL"]);

  if (usersErr || !premiumUsers?.length) {
    console.log("[cron/weekly-summaries] No Premium users found");
    return NextResponse.json({ processed: 0, skipped: 0, errors: 0 });
  }

  const userIds = premiumUsers.map((r) => r.user_id);

  // ── Find which of those have stale summaries ──────────────────────────────
  const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS).toISOString();

  const { data: profiles, error: profilesErr } = await adminClient
    .from("profiles")
    .select("id, weekly_summary_generated_at")
    .in("id", userIds);

  if (profilesErr) {
    console.error("[cron/weekly-summaries] Failed to fetch profiles:", profilesErr);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Build a map of userId → last generated timestamp
  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.id, p.weekly_summary_generated_at])
  );

  // A user is stale if: they have no profile row, summary is null, or summary is old
  const staleUserIds = userIds.filter((id) => {
    const generatedAt = profileMap.get(id);
    if (!generatedAt) return true; // never generated
    return new Date(generatedAt).getTime() < Date.now() - STALE_THRESHOLD_MS;
  }).slice(0, MAX_USERS_PER_RUN);

  if (!staleUserIds.length) {
    console.log("[cron/weekly-summaries] All summaries are fresh — nothing to do");
    return NextResponse.json({ processed: 0, skipped: userIds.length, errors: 0 });
  }

  console.log(`[cron/weekly-summaries] Processing ${staleUserIds.length} stale users`);

  // ── Generate summaries ────────────────────────────────────────────────────
  let processed = 0;
  let errors = 0;
  const startTime = Date.now();
  const TIME_GUARD_MS = 240_000; // Stop after 4 minutes, leave 1 minute buffer

  for (const userId of staleUserIds) {
    // Time guard — stop processing if we're running long
    if (Date.now() - startTime > TIME_GUARD_MS) {
      console.warn(`[cron/weekly-summaries] Time guard hit — stopping after ${processed} users`);
      break;
    }

    try {
      const result = await generateWeeklySummaryForUser(userId, adminClient);
      if (result.ok) {
        processed++;
        console.log(`[cron/weekly-summaries] ✓ ${userId} — generated at ${result.generatedAt}`);
      } else {
        if (result.reason !== "no_data") errors++;
        console.log(`[cron/weekly-summaries] ⚠ ${userId} — skipped (${result.reason})`);
      }
    } catch (err) {
      errors++;
      console.error(`[cron/weekly-summaries] ✗ ${userId} — unexpected error:`, err);
    }
  }

  const skipped = userIds.length - staleUserIds.length;
  console.log(`[cron/weekly-summaries] Done — processed: ${processed}, skipped: ${skipped}, errors: ${errors}`);

  return NextResponse.json({ processed, skipped, errors });
}
