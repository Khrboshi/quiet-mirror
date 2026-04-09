// app/api/paddle/portal/route.ts
// Creates a Paddle Customer Portal session and redirects the user there.
// The portal lets users update payment methods, view invoices, and cancel.

import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FALLBACK = "/settings/billing";

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
    const supabase = createServerSupabase();

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
      .select("paddle_customer_id, paddle_subscription_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr || !profile?.paddle_customer_id) {
      console.error("[paddle/portal] no paddle_customer_id for user:", user.id);
      return NextResponse.redirect(new URL(FALLBACK, getBaseUrl(req.url)), 303);
    }

    const paddle = getPaddle();

    // subscriptionIds is a plain string[] per the SDK type definition
    const subscriptionIds: string[] = profile.paddle_subscription_id
      ? [profile.paddle_subscription_id]
      : [];

    const session = await paddle.customerPortalSessions.create(
      profile.paddle_customer_id,
      subscriptionIds
    );

    const portalUrl = session.urls.general.overview;
    if (!portalUrl) {
      console.error("[paddle/portal] no portal URL in response:", session);
      return NextResponse.redirect(new URL(FALLBACK, getBaseUrl(req.url)), 303);
    }

    return NextResponse.redirect(portalUrl, 303);
  } catch (err: any) {
    console.error("[paddle/portal] error:", err?.message || err);
    return NextResponse.redirect(
      new URL(FALLBACK, getBaseUrl(req.url)),
      303
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
