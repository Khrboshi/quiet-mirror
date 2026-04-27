/**
 * app/auth/callback/route.ts
 *
 * Handles the OAuth / magic-link callback from Supabase Auth.
 * Exchanges the one-time code for a session, sets auth cookies,
 * then redirects to /dashboard (or ?next= param if present).
 */
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // No code => back to login
  if (!code) {
    return NextResponse.redirect(new URL("/magic-login", url.origin), { status: 303 });
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options, path: "/" });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const to = new URL("/magic-login", url.origin);
    to.searchParams.set("callback_error", "1");
    return NextResponse.redirect(to, { status: 303 });
  }

  // Always go to /auth/complete which signals Tab A and handles tab closing.
  // Destination is hardcoded to /dashboard — email clients mangle query params
  // so passing next=/dashboard through the redirect chain is unreliable.
  return NextResponse.redirect(
    new URL("/auth/complete", url.origin),
    { status: 303 }
  );
}
