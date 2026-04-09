// app/api/paddle/webhook/route.ts
// Handles Paddle subscription lifecycle events and updates user plans in Supabase.
//
// ENV VARS REQUIRED (Vercel):
//   PADDLE_API_KEY         — Paddle secret API key
//   PADDLE_WEBHOOK_SECRET  — from Paddle dashboard → Notifications → your endpoint
//
// EVENTS HANDLED:
//   subscription.activated     → PREMIUM
//   subscription.trialing      → PREMIUM
//   transaction.completed      → PREMIUM  (renewal)
//   subscription.past_due      → FREE
//   subscription.paused        → FREE
//   subscription.canceled      → FREE
//   transaction.payment_failed → FREE
//
// USER IDENTIFICATION:
//   supabase_user_id is passed in customData at checkout time and flows
//   through to all subscription + transaction webhook events automatically.
//
// SUPABASE MIGRATION REQUIRED — add to profiles table:
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paddle_customer_id TEXT;
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;

import { NextResponse } from "next/server";
import { Paddle, Environment, EventName } from "@paddle/paddle-node-sdk";
import { createServerClient } from "@supabase/ssr";
import { setUserPlan } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

function getPaddle() {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY is not set");
  return new Paddle(key, {
    environment:
      process.env.PADDLE_ENVIRONMENT === "sandbox"
        ? Environment.sandbox
        : Environment.production,
  });
}

function createAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function extractUserId(customData: unknown): string | null {
  if (!customData || typeof customData !== "object") return null;
  const id = (customData as Record<string, unknown>).supabase_user_id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[paddle/webhook] PADDLE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("paddle-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  const paddle = getPaddle();

  // unmarshal() returns a Promise<EventEntity>
  let event: Awaited<ReturnType<typeof paddle.webhooks.unmarshal>>;
  try {
    event = await paddle.webhooks.unmarshal(body, webhookSecret, signature);
  } catch (err: any) {
    console.error("[paddle/webhook] signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  if (!event) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const supabase = createAdminSupabase();

  try {
    switch (event.eventType) {

      // ── Subscription activated / trialing → PREMIUM ───────────────────────
      case EventName.SubscriptionActivated:
      case EventName.SubscriptionTrialing: {
        const sub = event.data as any;
        const userId = extractUserId(sub.customData);
        if (!userId) {
          console.error("[paddle/webhook] no supabase_user_id in customData:", event.eventType);
          break;
        }

        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });

        // Store Paddle IDs so portal + transactions routes can use them.
        // Log if it fails — setUserPlan succeeded so user is PREMIUM,
        // but portal/transactions routes won't work until this is stored.
        const { error: profileErr } = await supabase
          .from("profiles")
          .update({
            paddle_customer_id:     sub.customerId ?? null,
            paddle_subscription_id: sub.id         ?? null,
          })
          .eq("id", userId);

        if (profileErr) {
          console.error(
            "[paddle/webhook] failed to store paddle IDs on profiles — portal/transactions will fail for user:",
            userId, profileErr
          );
        }

        console.log("[paddle/webhook] upgraded to PREMIUM:", userId, event.eventType);
        break;
      }

      // ── Transaction completed (renewal payment) → confirm PREMIUM ─────────
      case EventName.TransactionCompleted: {
        const tx = event.data as any;
        const userId = extractUserId(tx.customData);
        if (!userId) {
          console.error("[paddle/webhook] TransactionCompleted — no user ID");
          break;
        }

        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });
        console.log("[paddle/webhook] renewal — confirmed PREMIUM:", userId);
        break;
      }

      // ── Payment failed → FREE immediately ─────────────────────────────────
      case EventName.TransactionPaymentFailed: {
        const tx = event.data as any;
        const userId = extractUserId(tx.customData);
        if (!userId) {
          console.error("[paddle/webhook] TransactionPaymentFailed — no user ID");
          break;
        }

        await setUserPlan({ supabase: supabase as any, userId, planType: "FREE" });
        console.log("[paddle/webhook] payment failed — downgraded to FREE:", userId);
        break;
      }

      // ── Subscription past_due / paused / canceled → FREE ──────────────────
      case EventName.SubscriptionPastDue:
      case EventName.SubscriptionPaused:
      case EventName.SubscriptionCanceled: {
        const sub = event.data as any;
        const userId = extractUserId(sub.customData);
        if (!userId) {
          console.error("[paddle/webhook] downgrade event — no user ID:", event.eventType);
          break;
        }

        await setUserPlan({ supabase: supabase as any, userId, planType: "FREE" });
        console.log("[paddle/webhook] downgraded to FREE:", userId, event.eventType);
        break;
      }

      default:
        // Unhandled — log and return 200 so Paddle doesn't retry
        console.log("[paddle/webhook] unhandled event:", event.eventType);
        break;
    }
  } catch (err) {
    // Return 500 so Paddle retries the event
    console.error("[paddle/webhook] handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
