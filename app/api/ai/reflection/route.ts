/**
 * app/api/ai/reflection/route.ts
 *
 * POST — Generates an AI reflection for a journal entry.
 *
 * Flow:
 * 1. Auth check — must be logged in
 * 2. Plan check — FREE users must have remaining credits
 * 3. Crisis detection — checked before any AI call; returns a safe response
 * 4. generateReflectionFromEntry() — Groq/Llama call with quality-gate post-processing
 * 5. Persist ai_response to journal_entries and decrement credits
 *
 * Credits: decremented atomically via decrementCreditIfAllowed().
 *          PREMIUM/TRIAL users are never blocked.
 * Locale:  reads qm:locale cookie and passes language to the AI.
 */
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { generateReflectionFromEntry, detectCrisisContent } from "@/lib/ai/generateReflection";
import { type PlanType, normalizePlan } from "@/lib/planUtils";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocaleFromCookieString, SUPPORTED_LOCALES } from "@/app/lib/i18n";
import { PRICING } from "@/app/lib/pricing";

type JournalEntry = {
  id: string;
  title: string | null;
  content: string | null;
  ai_response: string | null;
};

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const revalidate = 0;
export const runtime = "nodejs";

type ConsumeOk = { ok: true; remaining: number };
type ConsumeFail = { ok: false; status: number; error: string };
type ConsumeResult = ConsumeOk | ConsumeFail;

function isConsumeFail(r: ConsumeResult): r is ConsumeFail {
  return r.ok === false;
}

function isParamMismatchError(msg: string) {
  const m = msg.toLowerCase();
  return (
    m.includes("could not find the function") ||
    (m.includes("function") && m.includes("does not exist")) ||
    m.includes("unknown parameter") ||
    m.includes("invalid input syntax") ||
    m.includes("no function matches")
  );
}

function isNoCreditsError(msg: string) {
  const m = msg.toLowerCase();
  return (
    m.includes("no credits") ||
    m.includes("insufficient") ||
    m.includes("limit") ||
    m.includes("quota") ||
    m.includes("exceeded") ||
    m.includes("out of credits") ||
    m.includes("reflection limit")
  );
}

async function consumeOneCredit(supabase: SupabaseClient, userId: string): Promise<ConsumeResult> {
  let rpcData: { remaining_credits?: number }[] | { remaining_credits?: number } | null = null;
  let rpcErr: { message?: string } | null = null;

  const first = await supabase.rpc("consume_reflection_credit", {
    p_user_id: userId,
    p_amount: 1,
  });

  rpcData = first?.data;
  rpcErr = first?.error;

  if (rpcErr && isParamMismatchError(String(rpcErr.message || ""))) {
    const second = await supabase.rpc("consume_reflection_credit", {
      p_amount: 1,
    });
    rpcData = second?.data;
    rpcErr = second?.error;
  }

  if (rpcErr) {
    const msg = String(rpcErr.message || "");
    if (msg.toLowerCase().includes("not_authenticated")) {
      return { ok: false, status: 401, error: "Unauthorized" };
    }
    if (isNoCreditsError(msg)) {
      return { ok: false, status: 402, error: "Reflection limit reached" };
    }
    console.error("[reflection] consume_reflection_credit rpc error:", rpcErr);
    return { ok: false, status: 500, error: "Failed to consume credits" };
  }

  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  const remaining =
    row && typeof row.remaining_credits === "number" ? (row.remaining_credits as number) : null;

  if (remaining === null) {
    return { ok: false, status: 402, error: "Reflection limit reached" };
  }

  return { ok: true, remaining };
}

/**
 * Atomically refunds one reflection credit on AI generation failure.
 *
 * WHY NOT `remaining = remainingAfterConsume + 1`:
 *   The Groq call can take up to 25 seconds. A concurrent request from the same
 *   user could consume another credit during that window. Writing a stale snapshot
 *   value + 1 would then overwrite the concurrent write and produce an incorrect
 *   balance. For example: consumed → remaining=2, concurrent request → remaining=1,
 *   Groq fails → stale refund writes 3 instead of the correct 2.
 *
 * THIS APPROACH — atomic read-then-conditional-write:
 *   1. Read the *current* remaining_credits at refund time (not the pre-Groq snapshot).
 *   2. Write current + 1 only if it would not exceed the monthly cap (prevents
 *      over-refunding if the row was reset between consume and refund).
 *   3. Use `.eq("remaining_credits", current)` as an optimistic lock — if a
 *      concurrent write changed the value between our read and write, 0 rows are
 *      updated. This is correct: the concurrent write already reflects the true
 *      balance, and skipping the refund is safe (the credit was legitimately consumed).
 *
 * No new database functions required.
 */
async function refundOneCredit(supabase: SupabaseClient, userId: string): Promise<void> {
  // Read current balance at refund time — never use the pre-Groq snapshot value
  const { data, error: readErr } = await supabase
    .from("user_credits")
    .select("remaining_credits")
    .eq("user_id", userId)
    .maybeSingle();

  if (readErr || !data) {
    console.error("[reflection] refund: failed to read current credits:", readErr);
    return;
  }

  // Guard: bail if remaining_credits is not a valid number.
  // Defaulting to 0 would incorrectly grant a credit to a corrupted or
  // transitional row (e.g. null from a mid-migration state).
  if (typeof data.remaining_credits !== "number") {
    console.warn(
      "[reflection] refund: remaining_credits is not a number — skipping refund to avoid minting credits:",
      data.remaining_credits
    );
    return;
  }

  const current = data.remaining_credits;

  // Guard: never exceed the monthly cap (handles edge case where row was reset)
  if (current >= PRICING.freeMonthlyCredits) {
    console.log("[reflection] refund: credits already at cap, skipping");
    return;
  }

  // Optimistic-lock write: only succeeds if no concurrent write changed the value
  const { data: updateData, error: writeErr } = await supabase
    .from("user_credits")
    .update({
      remaining_credits: current + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("remaining_credits", current) // optimistic lock
    .select("remaining_credits");

  if (writeErr) {
    console.error("[reflection] refund: write failed:", writeErr);
  } else if (!updateData || updateData.length === 0) {
    // 0 rows updated — either a concurrent write changed remaining_credits between
    // our read and write (expected race, correct to skip), or an unexpected filter
    // mismatch. Log at debug level so production traces can distinguish the two.
    console.log(
      "[reflection] refund: optimistic lock — 0 rows updated for user:",
      userId,
      "expected_credits:", current
    );
  }
}

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

function tryParseReflection(aiResponse: unknown) {
  if (typeof aiResponse !== "string") return null;
  try {
    const parsed = JSON.parse(aiResponse);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.summary === "string" &&
      parsed.summary.length > 0
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

export async function POST(req: Request) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noStoreHeaders() });
  }

  const userId = user.id;

  const body = await req.json().catch(() => ({}));
  const entryId = typeof body?.entryId === "string" ? body.entryId.trim() : "";
  const cookieLocale = getLocaleFromCookieString(req.headers.get("cookie") ?? "");
  const rawLocale    = typeof body?.locale === "string" ? body.locale.trim() : "";
  const locale: string = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : cookieLocale;

  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400, headers: noStoreHeaders() });
  }

  const { data: rawEntry, error: entryErr } = await supabase
    .from("journal_entries")
    .select("id,title,content,ai_response")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (entryErr) {
    console.error("[reflection] failed to read journal_entries:", entryErr);
    return NextResponse.json({ error: "Failed to load entry" }, { status: 500, headers: noStoreHeaders() });
  }

  const entry = rawEntry as JournalEntry | null;

  if (!entry?.id) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404, headers: noStoreHeaders() });
  }

  const content = typeof entry.content === "string" ? entry.content.trim() : "";
  const title = typeof entry.title === "string" ? entry.title.trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Entry has no content" }, { status: 400, headers: noStoreHeaders() });
  }

  if (content.length > 20000) {
    return NextResponse.json(
      { error: "Entry too long. Please shorten it a bit." },
      { status: 413, headers: noStoreHeaders() }
    );
  }

  // ── Crisis safety check ─────────────────────────────────────────────────
  // If the entry contains crisis signals, return a warm support response
  // instead of a normal reflection. No credit is consumed.
  if (detectCrisisContent(`${title} ${content}`)) {
    const crisisReflection = {
      crisis: true,
      summary: "What you wrote matters, and you matter.\nIf you're carrying something that feels too heavy right now, please reach out to someone who can help.",
      resources: [
        { label: "988 Suicide & Crisis Lifeline (US)", value: "Call or text 988" },
        { label: "Samaritans (UK/Ireland)", value: "Call 116 123" },
        { label: "Crisis Text Line", value: "Text HOME to 741741" },
        { label: "International Association for Suicide Prevention", value: "https://www.iasp.info/resources/Crisis_Centres/" },
      ],
      message: "Your entries stay private. You don't have to figure this out alone.",
    };
    return NextResponse.json(
      { reflection: crisisReflection },
      { headers: noStoreHeaders() }
    );
  }

  const { data: creditsRow, error: creditsErr } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle();

  if (creditsErr) {
    console.error("[reflection] failed to read user_credits:", creditsErr);
  }

  let planType = normalizePlan((creditsRow as { plan_type?: unknown } | null)?.plan_type);

  await ensureCreditsFresh({ supabase, userId });

  // Trust the plan_type maintained by the Stripe webhook in the DB.
  // No live Stripe API call needed here — the webhook already handles
  // subscription changes (active → past_due → cancelled → FREE).
  const effectiveTier: "FREE" | "PREMIUM" = (planType === "PREMIUM" || planType === "TRIAL") ? "PREMIUM" : "FREE";

  const existingFull = tryParseReflection(entry.ai_response);
  if (existingFull) {
    return NextResponse.json(
      { reflection: existingFull, remainingCredits: null },
      { headers: noStoreHeaders() }
    );
  }

  const isUnlimited = effectiveTier === "PREMIUM";
  let remainingAfterConsume: number | null = null;

  if (!isUnlimited) {
    const consumed = await consumeOneCredit(supabase, userId);
    if (isConsumeFail(consumed)) {
      return NextResponse.json(
        { error: consumed.error },
        { status: consumed.status, headers: noStoreHeaders() }
      );
    }
    remainingAfterConsume = consumed.remaining;
  }

  try {
    let recentThemes: string[] = [];
    try {
      const { data: recentEntries } = await supabase
        .from("journal_entries")
        .select("ai_response")
        .eq("user_id", userId)
        .not("ai_response", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentEntries) {
        for (const row of recentEntries) {
          try {
            const parsed = JSON.parse((row as { ai_response: string }).ai_response);
            if (Array.isArray(parsed?.themes)) {
              recentThemes.push(...parsed.themes.slice(0, 2));
            }
          } catch {}
        }
        recentThemes = [...new Set(recentThemes)].slice(0, 5);
      }
    } catch {}

    const reflection = await generateReflectionFromEntry({
      content,
      title,
      plan: effectiveTier,
      recentThemes,
      locale,
    });

    const { error: updErr } = await supabase
      .from("journal_entries")
      .update({ ai_response: JSON.stringify(reflection) })
      .eq("id", entryId)
      .eq("user_id", userId);

    if (updErr) {
      console.error("[reflection] journal_entries update failed:", updErr);
    }

    const { error: usageErr } = await supabase.from("reflection_usage").insert({
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
    });

    if (usageErr) {
      console.error("[reflection] reflection_usage insert failed:", usageErr);
    }

    return NextResponse.json(
      { reflection, remainingCredits: effectiveTier === "FREE" ? remainingAfterConsume : null },
      { headers: noStoreHeaders() }
    );
  } catch (err) {
    console.error("[reflection] generation failed:", err);

    if (!isUnlimited && remainingAfterConsume !== null) {
      try {
        await refundOneCredit(supabase, userId);
      } catch (refundErr) {
        console.error("[reflection] refund failed:", refundErr);
      }
    }

    return NextResponse.json(
      { error: "Failed to generate reflection" },
      { status: 500, headers: noStoreHeaders() }
    );
  }
}
