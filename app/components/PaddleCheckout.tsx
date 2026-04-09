"use client";

// app/components/PaddleCheckout.tsx
// Loads Paddle.js and exposes openPaddleCheckout() globally.
// The upgrade button calls this with priceId + userId + email,
// and Paddle.js opens an overlay checkout directly — no server transaction needed.
//
// ENV VARS REQUIRED (NEXT_PUBLIC — available client-side):
//   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN — Paddle dashboard → Developer Tools → Authentication → Client-side tokens
//   NEXT_PUBLIC_PADDLE_ENVIRONMENT  — "sandbox" or "production"

import { useEffect } from "react";
import { CONFIG } from "@/app/lib/config";

declare global {
  interface Window {
    Paddle?: any;
    openPaddleCheckout?: (opts: {
      priceId: string;
      userId: string;
      userEmail: string | null;
    }) => void;
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

    const initPaddle = () => {
      if (!window.Paddle) return;

      if (environment === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({ token: clientToken });

      // Expose globally so UpgradeButton can call without prop-drilling
      window.openPaddleCheckout = ({
        priceId,
        userId,
        userEmail,
      }: {
        priceId: string;
        userId: string;
        userEmail: string | null;
      }) => {
        window.Paddle?.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          // customData flows through to all webhook events — how we identify the user
          customData: { supabase_user_id: userId },
          ...(userEmail ? { customer: { email: userEmail } } : {}),
          settings: {
            successUrl: `${CONFIG.siteUrl}/upgrade/confirmed`,
            theme: "light",
          },
        });
      };
    };

    if (window.Paddle) {
      initPaddle();
      return () => {
        delete window.openPaddleCheckout;
      };
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = initPaddle;
    document.head.appendChild(script);

    return () => {
      delete window.openPaddleCheckout;
    };
  }, []);

  return null;
}
