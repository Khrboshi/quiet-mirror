// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function createSupabase() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components might block setting cookies; safe to ignore here.
          }
        },
      },
    }
  );
}

export async function GET(req: Request) {
  try {
    const supabase = createSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/magic-login", req.url), 303);
    }

    // Read the entire row so we don't fail if a specific column doesn't exist.
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 400 });
    }

    // Try common field names (use whichever exists in your schema)
    const stripeCustomerId =
      (profile as any).stripe_customer_id ||
      (profile as any).stripeCustomerId ||
      (profile as any).stripe_customer ||
      (profile as any).customer_id ||
      (profile as any).stripeCustomer;

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error:
            "No Stripe customer id stored for this user. Add profiles.stripe_customer_id and re-run checkout (or backfill the value).",
        },
        { status: 400 }
      );
    }

    const url = new URL(req.url);
    const returnUrlParam = url.searchParams.get("returnUrl") || undefined;

    const return_url =
      returnUrlParam ||
      process.env.STRIPE_PORTAL_RETURN_URL ||
      "https://havenly-2-1.vercel.app/settings/billing";

    const session = await stripe.billingPortal.sessions.create({
      customer: String(stripeCustomerId),
      return_url,
    });

    // IMPORTANT: redirect the browser to Stripe portal
    return NextResponse.redirect(session.url!, 303);
  } catch (e: any) {
    console.error("[portal] error:", e?.message || e);
    return NextResponse.json({ error: "Portal error" }, { status: 500 });
  }
}
