/**
 * app/components/SupabaseSessionProvider.tsx
 *
 * Root auth context — wraps the app and makes the Supabase client and
 * current session available via useSupabase() throughout the component tree.
 *
 * On mount: subscribes to onAuthStateChange so session updates propagate
 * automatically (login, logout, token refresh).
 * On sign-in: calls identify() to link the user to PostHog analytics.
 * On sign-out: calls resetIdentity() to clear the PostHog session.
 *
 * Uses a single browser client instance (getSupabaseBrowserClient) to
 * avoid multiple GoTrue subscriptions.
 */
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { identify, resetIdentity } from "@/app/components/telemetry";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseSessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function syncSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!alive) return;

        if (error) {
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(data.session ?? null);
        setLoading(false);
      } catch {
        if (!alive) return;
        setSession(null);
        setLoading(false);
      }
    }

    syncSession();

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!alive) return;
      setSession(newSession ?? null);
      setLoading(false);

      // PostHog: link events to the logged-in user
      if (newSession?.user) {
        identify(newSession.user.id, { email: newSession.user.email });
      } else if (event === "SIGNED_OUT") {
        resetIdentity();
      }
    });

    const onVis = () => {
      if (document.visibilityState === "visible") syncSession();
    };
    window.addEventListener("focus", syncSession);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      data.subscription.unsubscribe();
      window.removeEventListener("focus", syncSession);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used within SupabaseSessionProvider");
  return ctx;
}
