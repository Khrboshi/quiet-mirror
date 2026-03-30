// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";
import { PRICING } from "@/app/lib/pricing";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    // Guard: don't create a second checkout session if the user is already Premium.
    // Without this check, a Premium user could open a second subscription and be
    // charged twice — Stripe won't deduplicate concurrent subscriptions automatically.
    const { data: creditsRow } = await supabase
      .from("user_credits")
      .select("plan_type")
      .eq("user_id", user.id)
      .maybeSingle();

    const currentPlan = String(creditsRow?.plan_type ?? "FREE").toUpperCase();
    if (currentPlan === "PREMIUM" || currentPlan === "TRIAL") {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 409 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 }
      );
    }

    // Fix: read from env — never fall back to a hardcoded staging domain.
    // NEXT_PUBLIC_SITE_URL must be set in Vercel environment variables.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.error("[stripe/checkout] NEXT_PUBLIC_SITE_URL is not set");
      return NextResponse.json(
        { error: "Site URL not configured" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${siteUrl}/upgrade/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/upgrade`,
      subscription_data: {
        // PRICING.trialDays is the single source of truth for the trial length.
        // Change it in app/lib/pricing.ts — this API call updates automatically.
        trial_period_days: PRICING.trialDays,
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
