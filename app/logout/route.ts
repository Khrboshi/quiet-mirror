import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

async function signOutAndRedirect(request: Request) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.signOut();

  const redirectUrl = new URL("/magic-login?logged_out=1", request.url);

  return NextResponse.redirect(redirectUrl, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

/**
 * Handles button-triggered logout (fetch POST)
 */
export async function POST(request: Request) {
  return signOutAndRedirect(request);
}

/**
 * Handles direct navigation / prefetch / browser access
 */
export async function GET(request: Request) {
  return signOutAndRedirect(request);
}
