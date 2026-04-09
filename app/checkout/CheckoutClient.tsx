"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CONFIG } from "@/app/lib/config";

// Minimal Paddle.js type — we only use what we call
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { Paddle?: any }
}

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "opening" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const txnId = searchParams.get("_ptxn");
    if (!txnId) {
      setErrorMsg("No transaction found. Please try again from the upgrade page.");
      setStatus("error");
      return;
    }

    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    if (!clientToken) {
      setErrorMsg("Checkout configuration error. Please contact " + CONFIG.supportEmail);
      setStatus("error");
      return;
    }

    // Dynamically load Paddle.js v2
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;

    script.onload = () => {
      const Paddle = window.Paddle;
      if (!Paddle) {
        setErrorMsg("Failed to load secure checkout. Please refresh and try again.");
        setStatus("error");
        return;
      }

      // Set sandbox mode if needed — must happen before Initialize
      if (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox") {
        Paddle.Environment.set("sandbox");
      }

      // Initialize Paddle.js with client-side token
      Paddle.Initialize({ token: clientToken });

      setStatus("opening");

      // Open the overlay checkout for the transaction created server-side.
      // successUrl sends the user to /upgrade/confirmed after payment.
      Paddle.Checkout.open({
        transactionId: txnId,
        settings: {
          successUrl: `${window.location.origin}/upgrade/confirmed`,
          displayModeTheme: "light",
        },
      });
    };

    script.onerror = () => {
      setErrorMsg("Failed to load secure checkout. Please check your connection and try again.");
      setStatus("error");
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [searchParams]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-qm-bg px-4">
        <div className="max-w-sm text-center">
          <p className="text-sm text-qm-danger">{errorMsg}</p>
          <Link
            href="/upgrade"
            className="mt-4 inline-block text-sm text-qm-positive underline underline-offset-2"
          >
            ← Back to upgrade
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-qm-bg">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-qm-accent border-t-transparent" />
        <p className="mt-4 text-sm text-qm-faint">
          {status === "loading" ? "Preparing secure checkout…" : "Opening checkout…"}
        </p>
        <p className="mt-1 text-xs text-qm-faint">Powered by Paddle</p>
      </div>
    </div>
  );
}
