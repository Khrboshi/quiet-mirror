import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const supabase = createServerSupabase();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get stripe_customer_id from profiles table
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profErr) {
      return NextResponse.json(
        { error: profErr.message },
        { status: 500 }
      );
    }

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found for this user." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));

    const return_url =
      body?.returnUrl ||
      process.env.STRIPE_PORTAL_RETURN_URL ||
      "https://havenly-2-1.vercel.app/settings/billing";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: String(profile.stripe_customer_id),
      return_url,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (e: any) {
    console.error("[portal] error:", e?.message || e);
    return NextResponse.json({ error: "Portal error" }, { status: 500 });
  }
}
