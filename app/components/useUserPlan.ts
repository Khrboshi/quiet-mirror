"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { type PlanType, normalizePlan } from "@/lib/planUtils";

type PlanStateInternal = {
  loading: boolean;
  planType: PlanType;
  credits: number;
  renewalDate: string | null;
};

type PlanState = PlanStateInternal & {
  plan: "free" | "premium" | "trial";
  refresh: () => Promise<void>;
};

// Global cache (in-memory, per browser tab)
let cachedData: PlanStateInternal | null = null;
let cachedAtMs = 0;

// Avoid spamming requests across pages/routes
const REVALIDATE_MS = 15_000;

export function useUserPlan(): PlanState {
  const [state, setState] = useState<PlanStateInternal>(() => {
    return (
      cachedData || {
        loading: true,
        planType: "FREE",
        credits: 0,
        renewalDate: null,
      }
    );
  });

  const inFlightRef = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    // If a request is already in-flight, reuse it
    if (inFlightRef.current) return inFlightRef.current;

    const p = (async () => {
      try {
        const res = await fetch("/api/user/plan", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          // Keep existing state if server errors; don't overwrite with zeros.
          // But if we have no cachedData at all, fall back safely.
          if (!cachedData) {
            const fallback: PlanStateInternal = {
              loading: false,
              planType: "FREE",
              credits: 0,
              renewalDate: null,
            };
            cachedData = fallback;
            cachedAtMs = Date.now();
            setState(fallback);
          }
          return;
        }

        const data = await res.json().catch(() => ({}));

        const normalizedPlan = normalizePlan(data?.planType ?? data?.plan);

        const next: PlanStateInternal = {
          loading: false,
          planType: normalizedPlan,
          credits: typeof data?.credits === "number" ? data.credits : 0,
          renewalDate: typeof data?.renewalDate === "string" ? data.renewalDate : null,
        };

        cachedData = next;
        cachedAtMs = Date.now();
        setState(next);
      } catch {
        // Same rule: don't smash good cached state with zeros
        if (!cachedData) {
          const fallback: PlanStateInternal = {
            loading: false,
            planType: "FREE",
            credits: 0,
            renewalDate: null,
          };
          cachedData = fallback;
          cachedAtMs = Date.now();
          setState(fallback);
        }
      }
    })().finally(() => {
      inFlightRef.current = null;
    });

    inFlightRef.current = p;
    return p;
  }, []);

  useEffect(() => {
    // Always revalidate in background so Journal/Dashboard stay consistent
    // (but throttle it)
    const age = Date.now() - cachedAtMs;

    if (!cachedData) {
      load();
      return;
    }

    // If cached is older than REVALIDATE_MS, refresh; otherwise keep it.
    if (age > REVALIDATE_MS) {
      load();
    }
  }, [load]);

  const lowercasePlan =
    state.planType === "PREMIUM" ? "premium" : state.planType === "TRIAL" ? "trial" : "free";

  return {
    ...state,
    plan: lowercasePlan,
    refresh: load,
  };
}
