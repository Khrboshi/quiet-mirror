// app/api/paddle/checkout/route.ts
// Returns the data needed for Paddle.js to open an overlay checkout.
//
// Instead of creating a server-side transaction (which starts in draft state
// and causes a 400 when passed to Paddle.js), we return the priceId, userId,
// and userEmail so Paddle.js can create the transaction itself in ready state.
//
// Paddle.js passes our customData (supabase_user_id) through to all webhook
// events, so the webhook handler still identifies the user correctly.
//
// ENV VARS REQUIRED (Vercel):
//   PADDLE_PRICE_ID           — Paddle price ID for the subscription (pri_xxx)
//   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN — Paddle client-side token
//   NEXT_PUBLIC_PADDLE_ENVIRONMENT  — "sandbox" or "production"

import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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

    // Guard: never open a second checkout for an already-Premium user.
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
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    const priceId = process.env.PADDLE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json({ error: "Paddle price not configured" }, { status: 500 });
    }

    // Return the data Paddle.js needs to open the overlay directly.
    // Paddle.js creates the transaction in ready state automatically,
    // and our customData flows through to all webhook events.
    return NextResponse.json({
      priceId,
      userId: user.id,
      userEmail: user.email ?? null,
    });
  } catch (err: unknown) {
    console.error("[paddle/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to initiate checkout. Please try again." },
      { status: 500 }
    );
  }
}
