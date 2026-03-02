// app/api/ai/reflection/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";
import { generateReflectionFromEntry } from "@/lib/ai/generateReflection";

// Hard-disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

type PlanType = "FREE" | "TRIAL" | "PREMIUM";

function normalizePlan(v: unknown): PlanType {
  const p = String(v ?? "FREE").toUpperCase();
  return p === "PREMIUM" || p === "TRIAL" ? (p as PlanType) : "FREE";
}

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

async function consumeOneCredit(supabase: any, userId: string): Promise<ConsumeResult> {
  let rpcData: any = null;
  let rpcErr: any = null;

  // Attempt 1: RPC expects p_user_id + p_amount
  const first = await supabase.rpc("consume_reflection_credit", {
    p_user_id: userId,
    p_amount: 1,
  });

  rpcData = first?.data;
  rpcErr = first?.error;

  // Attempt 2: RPC expects only p_amount (user inferred via auth.uid())
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

function contentFingerprint(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

type Domain = "WORK" | "RELATIONSHIP" | "FITNESS" | "GENERAL";
function detectDomain(text: string): Domain {
  const s = (text || "").toLowerCase();
  const fitness =
    /run|running|\bkm\b|workout|training|exercise|gym|lift|lifting|cardio|pace|steps|sore|recovery|rest|sleep|hydration/.test(
      s
    );
  const work = /colleague|coworker|manager|team|meeting|work|office|client|boss/.test(s);
  const rel = /partner|wife|husband|girlfriend|boyfriend|relationship|love|date|argue|fight|gift/.test(s);
  if (fitness && !work && !rel) return "FITNESS";
  if (work && !fitness && !rel) return "WORK";
  if (rel && !fitness && !work) return "RELATIONSHIP";
  return "GENERAL";
}

function extractAnchorsForDebug(entry: string): string[] {
  const t = (entry || "").trim();
  const anchors: string[] = [];
  const add = (v: string) => {
    const s = String(v || "").trim();
    if (!s || anchors.includes(s)) return;
    anchors.push(s);
  };
  const quoteMatches = t.match(/[""][^""]+[""]/g) || [];
  for (const q of quoteMatches) {
    const cleaned = q.replace(/^[""]|[""]$/g, "").trim();
    if (cleaned.length >= 4 && cleaned.length <= 90) add(`"${cleaned}"`);
    if (anchors.length >= 3) break;
  }
  if (anchors.length < 2) {
    const sentences = t
      .split(/\n|[.!?]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    for (const s of sentences) {
      add(s.length > 110 ? s.slice(0, 110).trim() : s);
      if (anchors.length >= 2) break;
    }
  }
  return anchors.slice(0, 5);
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

  if (!entryId) {
    return NextResponse.json({ error: "Missing entryId" }, { status: 400, headers: noStoreHeaders() });
  }

  // ✅ CRITICAL: Do NOT trust content/title from the client.
  // Always load the entry from the database for this user + entryId.
  const { data: entry, error: entryErr } = await supabase
    .from("journal_entries")
    .select("id,title,content,ai_response")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (entryErr) {
    console.error("[reflection] failed to read journal_entries:", entryErr);
    return NextResponse.json({ error: "Failed to load entry" }, { status: 500, headers: noStoreHeaders() });
  }

  if (!entry?.id) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404, headers: noStoreHeaders() });
  }

  const content = typeof (entry as any)?.content === "string" ? String((entry as any).content).trim() : "";
  const title = typeof (entry as any)?.title === "string" ? String((entry as any).title).trim() : "";

  if (!content) {
    return NextResponse.json({ error: "Entry has no content" }, { status: 400, headers: noStoreHeaders() });
  }

  if (content.length > 20000) {
    return NextResponse.json(
      { error: "Entry too long. Please shorten it a bit." },
      { status: 413, headers: noStoreHeaders() }
    );
  }

  const url = new URL(req.url);
  const debugEnabled = url.searchParams.get("debug") === "1";
  const fp = debugEnabled ? contentFingerprint(content) : undefined;
  const snippet = debugEnabled ? content.slice(0, 120) : undefined;
  const domain = debugEnabled ? detectDomain(`${title}\n${content}`) : undefined;
  const anchors = debugEnabled ? extractAnchorsForDebug(content) : undefined;

  if (debugEnabled) {
    console.log("[reflection] entryId=", entryId, "fp=", fp, "domain=", domain, "anchors=", anchors);
  }

  await ensureCreditsFresh({ supabase, userId });

  const { data: creditsRow, error: creditsErr } = await supabase
    .from("user_credits")
    .select("plan_type")
    .eq("user_id", userId)
    .maybeSingle();

  if (creditsErr) {
    console.error("[reflection] failed to read user_credits:", creditsErr);
  }

  const planType = normalizePlan((creditsRow as any)?.plan_type);
  const isUnlimited = planType === "PREMIUM" || planType === "TRIAL";

  let remainingAfterConsume: number | null = null;

  // Consume credits ONLY after we know the entry is valid & owned by user.
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
    // ─── Cross-journal memory — fetch themes from last 5 reflections ──────────
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
            const parsed = JSON.parse((row as any).ai_response);
            if (Array.isArray(parsed?.themes)) {
              recentThemes.push(...parsed.themes.slice(0, 2));
            }
          } catch {}
        }
        recentThemes = [...new Set(recentThemes)].slice(0, 5);
      }
    } catch {}
    // ─────────────────────────────────────────────────────────────────────────

    const reflection = await generateReflectionFromEntry({
      content,
      title,
      plan: isUnlimited ? "PREMIUM" : "FREE",
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

    const payload: any = {
      reflection,
      remainingCredits: isUnlimited ? null : remainingAfterConsume,
    };

    if (debugEnabled) {
      payload.debug = { entryId, fp, snippet, domain, anchors };
    }

    return NextResponse.json(payload, { headers: noStoreHeaders() });
  } catch (err) {
    console.error("[reflection] generation failed:", err);

    // Best-effort refund if generation fails after consuming
    if (!isUnlimited && remainingAfterConsume !== null) {
      try {
        await supabase
          .from("user_credits")
          .update({
            remaining_credits: remainingAfterConsume + 1,
            updated_at: new Date().toISOString(),
          } as any)
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
