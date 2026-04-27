/**
 * app/components/ServiceWorkerRegister.tsx
 *
 * Registers the PWA service worker on mount (client only).
 * No-ops if the browser does not support service workers.
 */
"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
      } catch {
        // silent
      }
    };

    window.requestAnimationFrame(() => register());
  }, []);

  return null;
}
