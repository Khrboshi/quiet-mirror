import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function getPortalUrl(returnUrl?: string) {
  const supabase = createServerSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .maybeSingle();

  if (profErr) {
    return { error: profErr.message, status: 500 as const };
  }

  if (!profile?.stripe_customer_id) {
    return { error: "No Stripe customer found for this user.", status: 400 as const };
  }

  const finalReturnUrl =
    returnUrl ||
    process.env.STRIPE_PORTAL_RETURN_URL ||
    "https://havenly-2-1.vercel.app/settings/billing";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: String(profile.stripe_customer_id),
    return_url: finalReturnUrl,
  });

  return { url: portalSession.url, status: 200 as const };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get("returnUrl") || undefined;

    const result = await getPortalUrl(returnUrl);

    if (!("url" in result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.redirect(result.url, 303);
  } catch (e: any) {
    console.error("[portal] GET error:", e?.message || e);
    return NextResponse.json({ error: "Portal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const returnUrl = body?.returnUrl as string | undefined;

    const result = await getPortalUrl(returnUrl);

    if (!("url" in result)) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ url: result.url });
  } catch (e: any) {
    console.error("[portal] POST error:", e?.message || e);
    return NextResponse.json({ error: "Portal error" }, { status: 500 });
  }
}
