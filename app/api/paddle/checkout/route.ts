// app/api/paddle/checkout/route.ts
// Creates a Paddle transaction and returns the transaction ID.
//
// The client uses the transaction ID with Paddle.js to open an overlay
// checkout directly on the upgrade page — no external redirect needed.
//
// TRIAL: configure the trial period on your Paddle Price in the dashboard.
//        Set it to PRICING.trialDays (currently 3 days). Paddle requires
//        trial_period to be set on the Price itself, not at transaction time.
//
// ENV VARS REQUIRED (Vercel):
//   PADDLE_API_KEY            — Paddle secret API key (live_xxx or sandbox_xxx)
//   PADDLE_PRICE_ID           — Paddle price ID for the subscription (pri_xxx)
//   PADDLE_ENVIRONMENT        — "production" or "sandbox" (defaults to "production")
//   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN — Paddle client-side token (from dashboard)

import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

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

export async function POST() {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Guard: never create a second checkout for an already-Premium user.
    const { data: creditsRow, error: creditsErr } = await supabase
      .from("user_credits")
      .select("plan_type")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsErr) {
      console.error("[paddle/checkout] failed to read user_credits:", creditsErr);
      return NextResponse.json({ error: "Failed to verify plan status" }, { status: 500 });
    }

    const currentPlan = String(creditsRow?.plan_type ?? "FREE").toUpperCase();
    if (currentPlan === "PREMIUM" || currentPlan === "TRIAL") {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 }
      );
    }

    const priceId = process.env.PADDLE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Paddle price not configured" },
        { status: 500 }
      );
    }

    const paddle = getPaddle();

    // Look up existing Paddle customer to pre-fill email on checkout
    const { data: profile } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.paddle_customer_id ?? null;

    if (!customerId && user.email) {
      // Get-or-create: search by email first to avoid duplicate customers
      // on retry. customers.create() returns 409 if the email already exists.
      const existing = await paddle.customers.list({ email: [user.email] });
      const firstPage = await existing.next();
      const existingCustomer = firstPage?.[0] ?? null;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const created = await paddle.customers.create({
          email: user.email,
          customData: { supabase_user_id: user.id } as Record<string, unknown>,
        });
        customerId = created.id;
      }

      // Persist the customer ID — log if it fails but don't block checkout.
      const { error: upsertErr } = await supabase
        .from("profiles")
        .update({ paddle_customer_id: customerId })
        .eq("id", user.id);

      if (upsertErr) {
        console.error(
          "[paddle/checkout] failed to store paddle_customer_id:",
          upsertErr
        );
      }
    }

    // Create a Paddle transaction and return its ID to the client.
    // The client opens a Paddle.js overlay checkout using the transaction ID —
    // no external redirect needed. This is the correct pattern for web SaaS.
    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { supabase_user_id: user.id } as Record<string, unknown>,
      ...(customerId ? { customerId } : {}),
    });

    const transactionId = transaction.id;
    if (!transactionId) {
      console.error(
        "[paddle/checkout] no transaction ID in response. status:",
        transaction.status ?? "unknown"
      );
      return NextResponse.json(
        { error: "Paddle did not return a transaction ID" },
        { status: 500 }
      );
    }

    return NextResponse.json({ transactionId });
  } catch (err: unknown) {
    // Log full error server-side — never expose vendor/SDK details to client
    console.error("[paddle/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout. Please try again." },
      { status: 500 }
    );
  }
}
