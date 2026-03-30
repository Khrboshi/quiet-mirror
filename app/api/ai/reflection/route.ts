// app/api/ai/reflection/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { generateReflectionFromEntry, detectCrisisContent } from "@/lib/ai/generateReflection";
import { type PlanType, normalizePlan } from "@/lib/planUtils";
import type { SupabaseClient } from "@supabase/supabase-js";

// Local schema type — replace with Supabase generated types when available
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
  const supabase = createServerSupabase();

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
        await supabase
          .from("user_credits")
          .update({
            remaining_credits: remainingAfterConsume + 1,
            updated_at: new Date().toISOString(),
          } as { remaining_credits: number; updated_at: string })
          .eq("user_id", userId);
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
