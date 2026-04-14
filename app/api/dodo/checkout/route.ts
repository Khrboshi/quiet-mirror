// app/api/dodo/checkout/route.ts
// Creates a Dodo Payments checkout session for a new subscription.
// Returns a checkout_url that the client redirects to (Dodo-hosted checkout page).
//
// Flow:
//   1. Verify user is authenticated and not already Premium
//   2. Create a Dodo checkout session with the product + user metadata
//   3. Return { checkoutUrl } → client does window.location.href = checkoutUrl
//
// ENV VARS REQUIRED (Vercel):
//   DODO_PAYMENTS_API_KEY        — Dodo secret API key
//   DODO_PAYMENTS_ENVIRONMENT    — "test_mode" | "live_mode"
//   DODO_PAYMENTS_PRODUCT_ID     — pdt_... from Dodo dashboard
//   NEXT_PUBLIC_SITE_URL         — https://quietmirror.me (for return_url)

import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getDodo() {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (env !== "live_mode" && env !== "test_mode") {
    throw new Error(
      `DODO_PAYMENTS_ENVIRONMENT must be "live_mode" or "test_mode", got: "${env ?? "undefined"}"`
    );
  }
  return new DodoPayments({ bearerToken: key, environment: env });
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

    // Guard: never open a second checkout for an already-Premium user
    const { data: creditsRow, error: creditsErr } = await supabase
      .from("user_credits")
      .select("plan_type")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creditsErr) {
      console.error("[dodo/checkout] failed to read user_credits:", creditsErr);
      return NextResponse.json({ error: "Failed to verify plan status" }, { status: 500 });
    }

    const currentPlan = String(creditsRow?.plan_type ?? "FREE").toUpperCase();
    if (currentPlan === "PREMIUM" || currentPlan === "TRIAL") {
      return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
    }

    const productId = process.env.DODO_PAYMENTS_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json({ error: "Product not configured" }, { status: 500 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("[dodo/checkout] NEXT_PUBLIC_SITE_URL is not set");
      return NextResponse.json({ error: "Site URL not configured" }, { status: 500 });
    }

    // Require email — Dodo needs it to create a customer.
    // Users who signed up via phone auth or anonymous sessions won't have one.
    if (!user.email) {
      return NextResponse.json(
        { error: "An email address is required to subscribe. Please update your account email first." },
        { status: 400 }
      );
    }

    const dodo = getDodo();

    // Create a hosted checkout session.
    // metadata.supabase_user_id flows through to all webhook events
    // so the webhook handler can identify the user without a lookup table.
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email,
        name:  user.email,
      },
      return_url: `${siteUrl}/upgrade/confirmed`,
      metadata: { supabase_user_id: user.id },
    });

    if (!session.checkout_url) {
      console.error("[dodo/checkout] no checkout_url in response:", session);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: session.checkout_url });
  } catch (err: unknown) {
    console.error("[dodo/checkout] error:", err);
    return NextResponse.json(
      { error: "Failed to initiate checkout. Please try again." },
      { status: 500 }
    );
  }
}
