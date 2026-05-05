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

  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const to = new URL("/magic-login", url.origin);
    to.searchParams.set("callback_error", "1");
    return NextResponse.redirect(to, { status: 303 });
  }

  // Detect first-time users: check if they have zero journal entries.
  // New users should land on /journal/new (the write screen) rather than
  // /dashboard, so they reach their first reflection in under 2 minutes
  // (PRODUCT_BRIEF §6 — highest-leverage conversion moment).
  // The `firstUser` flag is forwarded to CompleteClient, which sets the
  // localStorage destination before Tab A navigates.
  let isFirstUser = false;
  try {
    const userId = sessionData?.session?.user?.id;
    if (userId) {
      const { count } = await supabase
        .from("journal_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      isFirstUser = (count ?? 0) === 0;
    }
  } catch {
    // Non-critical — fall back to /dashboard if query fails
  }

  const completeUrl = new URL("/auth/complete", url.origin);
  if (isFirstUser) completeUrl.searchParams.set("firstUser", "1");
  return NextResponse.redirect(completeUrl, { status: 303 });
}
