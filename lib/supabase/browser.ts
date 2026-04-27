/**
 * lib/supabase/browser.ts
 *
 * Singleton browser Supabase client — ensures only one GoTrue instance
 * exists per page load, preventing duplicate auth subscriptions.
 * Used exclusively in Client Components via getSupabaseBrowserClient().
 */
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  browserClient = createBrowserClient(url, anon, {
    auth: {
      // These 3 are the “must haves” for consistent client auth behavior
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,

      // Supabase OTP / magic link should use PKCE
      flowType: "pkce",
    },
    cookieOptions: {
      path: "/",
      sameSite: "lax",
      // in production over HTTPS, secure cookies are required
      secure: process.env.NODE_ENV === "production",
    },
  });

  return browserClient;
}
