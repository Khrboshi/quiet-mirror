/**
 * app/api/email/unsubscribe/route.ts
 *
 * GET — One-click unsubscribe handler linked from every newsletter email.
 *
 * Flow:
 *   1. Decode + verify the HMAC token from ?token=
 *   2. Set unsubscribed_at on the email_subscribers row
 *   3. Redirect to /unsubscribe/confirmed
 *
 * On any error (bad token, DB failure) redirect to /unsubscribe/confirmed
 * with ?error=1 so the page can show a helpful message instead of a blank
 * error screen. We never reveal whether an address exists in the list.
 *
 * ENV VARS REQUIRED:
 *   UNSUBSCRIBE_SECRET        — from app/lib/unsubscribeToken.ts
 *   NEXT_PUBLIC_SUPABASE_URL  — standard Supabase env
 *   SUPABASE_SERVICE_ROLE_KEY — admin client (bypasses RLS)
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { verifyUnsubscribeToken } from "@/app/lib/unsubscribeToken";
import { CONFIG } from "@/app/lib/config";

export const dynamic = "force-dynamic";

function createAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function confirmedUrl(error?: boolean): string {
  const base = `${CONFIG.siteUrl}/unsubscribe/confirmed`;
  return error ? `${base}?error=1` : base;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  const email = verifyUnsubscribeToken(token);

  if (!email) {
    console.warn("[email/unsubscribe] invalid or missing token");
    return NextResponse.redirect(confirmedUrl(true), 303);
  }

  try {
    const supabase = createAdminSupabase();

    const { error } = await supabase
      .from("email_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("email", email)
      .is("unsubscribed_at", null); // idempotent — skip if already unsubscribed

    if (error) {
      console.error("[email/unsubscribe] db error:", error);
      return NextResponse.redirect(confirmedUrl(true), 303);
    }

    console.log("[email/unsubscribe] unsubscribed:", email.slice(0, 4) + "***");
    return NextResponse.redirect(confirmedUrl(), 303);
  } catch (err) {
    console.error("[email/unsubscribe] unexpected error:", err);
    return NextResponse.redirect(confirmedUrl(true), 303);
  }
}
