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

  try {
    switch (payload.type) {

      // ── PREMIUM events ────────────────────────────────────────────────────
      case "subscription.active":
      case "subscription.renewed": {
        const sub = payload.data as any;
        const userId = extractUserId(sub.metadata);

        if (!userId) {
          console.error("[dodo/webhook] no supabase_user_id in metadata:", payload.type);
          break;
        }

        // Set plan first — user gets access even if profile update fails
        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });

        // Store Dodo IDs so portal and transactions routes can use them
        const { error: profileErr } = await supabase
          .from("profiles")
          .upsert(
            {
              id:                    userId,
              dodo_customer_id:      sub.customer?.customer_id ?? null,
              dodo_subscription_id:  sub.subscription_id       ?? null,
            },
            { onConflict: "id" }
          );

        if (profileErr) {
          console.error(
            "[dodo/webhook] failed to store Dodo IDs — portal/transactions will fail for user:",
            userId, profileErr
          );
        }

        console.log("[dodo/webhook] upgraded to PREMIUM:", userId, payload.type);
        break;
      }

      // ── FREE events ───────────────────────────────────────────────────────
      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.on_hold":
      case "subscription.failed": {
        const sub = payload.data as any;
        const userId = extractUserId(sub.metadata);

        if (!userId) {
          console.error("[dodo/webhook] downgrade event — no user ID:", payload.type);
          break;
        }

        // Idempotency guard: only downgrade if the subscription_id in this event
        // matches the subscription_id we have on record for this user.
        // This prevents a late retry of a cancelled event from overwriting a
        // newer subscription.active that the user has since created.
        const { data: profile } = await supabase
          .from("profiles")
          .select("dodo_subscription_id")
          .eq("id", userId)
          .maybeSingle();

        const incomingSubId = sub.subscription_id ?? null;
        const storedSubId   = profile?.dodo_subscription_id ?? null;

        if (incomingSubId && storedSubId && incomingSubId !== storedSubId) {
          console.log(
            "[dodo/webhook] ignoring stale downgrade — incoming sub:",
            incomingSubId, "stored sub:", storedSubId
          );
          break;
        }

        await setUserPlan({ supabase: supabase as any, userId, planType: "FREE" });
        console.log("[dodo/webhook] downgraded to FREE:", userId, payload.type);
        break;
      }

      default:
        // Unhandled — log and return 200 so Dodo doesn't retry
        console.log("[dodo/webhook] unhandled event:", payload.type);
        break;
    }
  } catch (err) {
    // Return 500 so Dodo retries the event
    console.error("[dodo/webhook] handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
