// app/api/dodo/webhook/route.ts
// Handles Dodo Payments subscription lifecycle events and updates user plans in Supabase.
//
// ENV VARS REQUIRED (Vercel):
//   DODO_PAYMENTS_WEBHOOK_KEY  — from Dodo dashboard → Developer → Webhooks → secret
//
// EVENTS HANDLED:
//   subscription.active    → PREMIUM  (initial activation or trial conversion)
//   subscription.renewed   → PREMIUM  (recurring payment succeeded)
//   subscription.cancelled → FREE
//   subscription.expired   → FREE
//   subscription.on_hold   → FREE     (payment failed, grace period)
//   subscription.failed    → FREE     (could not activate)
//
// USER IDENTIFICATION:
//   metadata.supabase_user_id is passed at checkout creation and flows
//   through to all subscription webhook events automatically.
//
// IDEMPOTENCY:
//   PREMIUM events: upsert must succeed — if it fails we return 500 so Dodo
//   retries. Without a stored dodo_subscription_id the stale-event guard is
//   untrustworthy.
//   FREE events: only downgrade if incoming subscription_id matches stored one,
//   preventing late retries from overwriting a newer active subscription.
//
// SUPABASE COLUMNS REQUIRED on profiles table:
//   dodo_customer_id TEXT
//   dodo_subscription_id TEXT

import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { createServerClient } from "@supabase/ssr";
import { setUserPlan } from "@/lib/creditRules";
import type { WebhookPayload } from "dodopayments/resources/webhook-events";

export const dynamic = "force-dynamic";

function createAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function extractUserId(metadata: Record<string, string> | undefined): string | null {
  if (!metadata) return null;
  const id = metadata["supabase_user_id"];
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function POST(req: Request) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    console.error("[dodo/webhook] DODO_PAYMENTS_WEBHOOK_KEY not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const body = await req.text();
  const webhookHeaders = {
    "webhook-id":        req.headers.get("webhook-id") ?? "",
    "webhook-signature": req.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
  };

  let payload: WebhookPayload;
  try {
    const wh = new Webhook(webhookKey);
    payload = (await wh.verify(body, webhookHeaders)) as WebhookPayload;
  } catch (err: any) {
    console.error("[dodo/webhook] signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminSupabase();

  switch (payload.type) {

    // ── PREMIUM events ──────────────────────────────────────────────────────
    case "subscription.active":
    case "subscription.renewed": {
      const sub = payload.data as any;
      const userId = extractUserId(sub.metadata);

      if (!userId) {
        console.error("[dodo/webhook] no supabase_user_id in metadata:", payload.type);
        // Return 400 — don't ACK events we can't map to a user.
        // Dodo will retry; if metadata is permanently missing the event
        // will exhaust retries and appear in the Dodo dashboard.
        return NextResponse.json(
          { error: "Missing supabase_user_id in metadata" },
          { status: 400 }
        );
      }

      // Persist Dodo IDs FIRST — dodo_subscription_id must be stored before
      // we ACK so the stale-event guard in FREE events is trustworthy.
      // If this fails, return 500 so Dodo retries the entire event.
      const { error: profileErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id:                   userId,
            dodo_customer_id:     sub.customer?.customer_id ?? null,
            dodo_subscription_id: sub.subscription_id       ?? null,
          },
          { onConflict: "id" }
        );

      if (profileErr) {
        console.error(
          "[dodo/webhook] failed to persist Dodo IDs — returning 500 for retry:",
          userId, profileErr
        );
        return NextResponse.json(
          { error: "Failed to persist subscription IDs" },
          { status: 500 }
        );
      }

      // Upgrade plan only after IDs are safely stored
      try {
        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });
      } catch (planErr) {
        console.error("[dodo/webhook] setUserPlan failed — returning 500 for retry:", userId, planErr);
        return NextResponse.json({ error: "Failed to set user plan" }, { status: 500 });
      }

      console.log("[dodo/webhook] upgraded to PREMIUM:", userId, payload.type);
      break;
    }

    // ── FREE events ─────────────────────────────────────────────────────────
    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.on_hold":
    case "subscription.failed": {
      const sub = payload.data as any;
      const userId = extractUserId(sub.metadata);

      if (!userId) {
        console.error("[dodo/webhook] downgrade event — no user ID:", payload.type);
        // Return 400 — don't ACK unmapped events
        return NextResponse.json(
          { error: "Missing supabase_user_id in metadata" },
          { status: 400 }
        );
      }

      // Read stored subscription_id for the stale-event guard.
      // If the read fails, return 500 so Dodo retries — proceeding without
      // the guard could downgrade a user who has a newer active subscription.
      const { data: profile, error: profileReadErr } = await supabase
        .from("profiles")
        .select("dodo_subscription_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileReadErr) {
        console.error("[dodo/webhook] failed to read profile for idempotency check:", userId, profileReadErr);
        return NextResponse.json(
          { error: "Failed to read subscription state" },
          { status: 500 }
        );
      }

      const incomingSubId = sub.subscription_id ?? null;
      const storedSubId   = profile?.dodo_subscription_id ?? null;

      // Fail closed if no stored subscription ID — without it the guard cannot
      // protect against stale events. Return 500 so Dodo retries; this should
      // only happen if the PREMIUM upsert previously failed.
      if (!storedSubId) {
        console.error("[dodo/webhook] no stored dodo_subscription_id for user:", userId, "— returning 500 for retry");
        return NextResponse.json(
          { error: "No stored subscription ID — cannot safely process downgrade" },
          { status: 500 }
        );
      }

      // Only skip if BOTH IDs are present and don't match.
      if (incomingSubId && incomingSubId !== storedSubId) {
        console.log(
          "[dodo/webhook] ignoring stale downgrade — incoming sub:",
          incomingSubId, "stored sub:", storedSubId
        );
        break;
      }

      try {
        await setUserPlan({ supabase: supabase as any, userId, planType: "FREE" });
      } catch (planErr) {
        console.error("[dodo/webhook] setUserPlan failed — returning 500 for retry:", userId, planErr);
        return NextResponse.json({ error: "Failed to set user plan" }, { status: 500 });
      }

      console.log("[dodo/webhook] downgraded to FREE:", userId, payload.type);
      break;
    }

    default:
      // Unhandled event type — ACK with 200 so Dodo doesn't retry indefinitely
      console.log("[dodo/webhook] unhandled event:", payload.type);
      break;
  }

  return NextResponse.json({ received: true });
}
