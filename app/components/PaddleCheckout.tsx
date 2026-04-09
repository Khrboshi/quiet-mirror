"use client";

// app/components/PaddleCheckout.tsx
// Loads Paddle.js and exposes openPaddleCheckout() globally so the upgrade
// button can open an overlay checkout using a server-created transaction ID.
//
// ENV VARS REQUIRED (NEXT_PUBLIC — available client-side):
//   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN — from Paddle dashboard → Developer Tools → Authentication → Client-side tokens
//   NEXT_PUBLIC_PADDLE_ENVIRONMENT  — "sandbox" or "production"

import { useEffect } from "react";
import { CONFIG } from "@/app/lib/config";

declare global {
  interface Window {
    Paddle?: any;
    openPaddleCheckout?: (transactionId: string) => void;
  }
}

export default function PaddleCheckout() {
  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT;

    if (!clientToken) {
      console.warn("[PaddleCheckout] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set");
      return;
    }

    // Load Paddle.js if not already loaded
    if (window.Paddle) {
      initPaddle(clientToken, environment);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => initPaddle(clientToken, environment);
    document.head.appendChild(script);

    return () => {
      // Clean up global when component unmounts
      delete window.openPaddleCheckout;
    };
  }, []);

  return null;
}

function initPaddle(clientToken: string, environment?: string) {
  if (!window.Paddle) return;

  if (environment === "sandbox") {
    window.Paddle.Environment.set("sandbox");
  }

  window.Paddle.Initialize({
    token: clientToken,
  });

  // Expose global opener so UpgradeButton (a sibling client component)
  // can call it without prop-drilling through the server component tree.
  window.openPaddleCheckout = (transactionId: string) => {
    window.Paddle?.Checkout.open({
      transactionId,
      settings: {
        successUrl: `${CONFIG.siteUrl}/upgrade/confirmed`,
        displayModeTheme: "light",
      },
    });
  };
}
