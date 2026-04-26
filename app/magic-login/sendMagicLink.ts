// app/magic-login/sendMagicLink.ts
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "";
  const url = raw.trim().replace(/\/+$/, ""); // strip trailing slash
  if (!url.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_SITE_URL is missing or invalid");
  }
  return url;
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { success: false, message: "Email is required." };

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

  const siteUrl = getSiteUrl();
  // Use a clean callback URL with no query params — email clients (Yahoo, Gmail)
  // can mangle or strip query parameters from redirect URLs inside magic links.
  // The callback route always sends users to /dashboard after session exchange.
  const emailRedirectTo = `${siteUrl}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}
