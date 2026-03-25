"use client";

import { useEffect } from "react";

export default function DeepLinkBootstrap() {
  useEffect(() => {
    const path = window.location.pathname;

    // If user opens via deep link, prevent visual flash
    if (path.startsWith("/auth/callback")) {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.style.background = isDark ? "#0b1120" : "#f5f0eb";
      document.body.style.opacity = "0.98";
    }
  }, []);

  return null;
}
