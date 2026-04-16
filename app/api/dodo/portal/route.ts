// app/api/dodo/portal/route.ts
// Creates a Dodo customer portal session and redirects the user there.
// The portal lets users update payment methods, view invoices, and cancel.
//
// ENV VARS REQUIRED (Vercel):
//   DODO_PAYMENTS_API_KEY     — Dodo secret API key
//   DODO_PAYMENTS_ENVIRONMENT — "test_mode" | "live_mode"

import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
// CustomerPortalSession is the SDK's typed response for customerPortal.create().
// It has { link: string } — no cast needed, no optional chaining on .link.
import type { CustomerPortalSession } from "dodopayments/resources/customers/customers.js";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FALLBACK = "/settings/billing";

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

function getBaseUrl(reqUrl: string): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  try {
    return new URL(reqUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL("/magic-login", getBaseUrl(req.url)),
        303
      );
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("dodo_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile?.dodo_customer_id) {
      console.error("[dodo/portal] no dodo_customer_id for user:", user.id);
      return NextResponse.redirect(new URL(FALLBACK, getBaseUrl(req.url)), 303);
    }

    const dodo = getDodo();

    // dodo.customers.customerPortal is fully typed in the SDK — no cast needed.
    // CustomerPortal.create() returns APIPromise<CustomerPortalSession>
    // where CustomerPortalSession = { link: string }.
    const session: CustomerPortalSession =
      await dodo.customers.customerPortal.create(profile.dodo_customer_id);

    // .link is typed string (non-optional) but guard anyway in case the API
    // returns an unexpected shape at runtime.
    const portalUrl = session.link;
    if (!portalUrl) {
      console.error("[dodo/portal] no link in portal session response:", session);
      return NextResponse.redirect(new URL(FALLBACK, getBaseUrl(req.url)), 303);
    }

    return NextResponse.redirect(portalUrl, 303);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[dodo/portal] error:", msg);
    return NextResponse.redirect(
      new URL(FALLBACK, new URL(req.url).origin),
      303
    );
  }
}

// Support POST as well (some links use POST)
export async function POST(req: Request) {
  return GET(req);
}
