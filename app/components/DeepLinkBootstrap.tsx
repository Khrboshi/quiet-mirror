/**
 * app/components/DeepLinkBootstrap.tsx
 *
 * Handles deep link routing on PWA launch — reads a stored
 * deep link from localStorage and navigates to it on mount,
 * then clears it so it only fires once.
 */
"use client";

import { useEffect } from "react";
import { CONFIG } from "@/app/lib/config";

export default function DeepLinkBootstrap() {
  useEffect(() => {
    const path = window.location.pathname;

    // If user opens via deep link, prevent visual flash by setting the
    // background colour immediately before React hydrates.
    if (path.startsWith("/auth/callback")) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.style.background = isDark
        ? CONFIG.themeColorDark
        : CONFIG.themeColorLight;
      document.body.style.opacity = "0.98";
    }
  }, []);

  return null;
}
