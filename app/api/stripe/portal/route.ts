// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Do NOT manually set apiVersion
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getBaseUrl(reqUrl: string) {
  // Prefer explicit public site URL
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  // Vercel URL fallback
  if (process.env.VERCEL_URL) {
    return process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback: derive from request origin (works in most deployments)
  try {
    return new URL(reqUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * Validates and resolves the returnUrl parameter.
 *
 * Security: only relative paths are accepted. Any value containing a host
 * (e.g. "https://evil.com") is silently replaced with the fallback.
 * This prevents open-redirect attacks where a crafted link causes Stripe
 * to send the user to an attacker-controlled site after billing.
 */
function sanitiseReturnUrl(input: string | null, fallback: string, baseUrl: string): string {
  const raw = (input ?? "").trim();

  // Must start with "/" and must not be a protocol-relative URL ("//evil.com")
  const isSafeRelative = raw.startsWith("/") && !raw.startsWith("//");

  const path = isSafeRelative ? raw : fallback;
  return new URL(path, baseUrl).toString();
}

// GET /api/stripe/portal?returnUrl=/settings/transactions
export async function GET(req: Request) {
  const fallbackReturn = "/settings/transactions";

  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Always redirect (avoid JSON for auth failures)
    if (!user) {
      return NextResponse.redirect(new URL("/magic-login", getBaseUrl(req.url)), 303);
    }

    // Read stripe_customer_id
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("[portal] profiles read error:", profErr);
      return NextResponse.redirect(
        new URL(fallbackReturn, getBaseUrl(req.url)),
        303
      );
    }

    let customerId = profile?.stripe_customer_id ?? null;

    // Create Stripe customer if missing
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_uid: user.id },
      });

      customerId = customer.id;

      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert({ id: user.id, stripe_customer_id: customerId }, { onConflict: "id" });

      if (upsertErr) {
        console.error("[portal] profiles upsert error:", upsertErr);
        return NextResponse.redirect(
          new URL(fallbackReturn, getBaseUrl(req.url)),
          303
        );
      }
    }

    // Return URL — sanitised to prevent open redirect
    const urlObj = new URL(req.url);
    const baseUrl = getBaseUrl(req.url);
    const returnParam =
      urlObj.searchParams.get("returnUrl") ||
      process.env.STRIPE_PORTAL_RETURN_URL ||
      fallbackReturn;

    const return_url = sanitiseReturnUrl(returnParam, fallbackReturn, baseUrl);

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error("[portal] error:", err?.message || err);
    return NextResponse.redirect(
      new URL(fallbackReturn, getBaseUrl(req.url)),
      303
    );
  }
}

// Allow POST to behave like GET
export async function POST(req: Request) {
  return GET(req);
}
