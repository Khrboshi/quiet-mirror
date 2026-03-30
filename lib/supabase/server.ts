import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type CookieOptions = {
  path?: string;
  sameSite?: "strict" | "lax" | "none" | boolean;
  secure?: boolean;
  maxAge?: number;
  httpOnly?: boolean;
  expires?: Date | number;
};

export const createServerSupabase = (): SupabaseClient => {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value,
          ...options,
          path: options?.path ?? "/",
          sameSite: (options?.sameSite as "strict" | "lax" | "none") ?? "lax",
          secure: options?.secure ?? process.env.NODE_ENV === "production",
        });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({
          name,
          value: "",
          ...options,
          path: options?.path ?? "/",
          sameSite: (options?.sameSite as "strict" | "lax" | "none") ?? "lax",
          secure: options?.secure ?? process.env.NODE_ENV === "production",
          maxAge: 0,
        });
      },
    },
  });
};
