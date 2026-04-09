// app/checkout/page.tsx
// Paddle checkout bridge page.
// The server-side checkout route creates a Paddle transaction and redirects
// here with ?_ptxn=TXN_ID. Paddle.js loads, detects the transaction, and
// opens the overlay checkout. On success, the user is sent to /upgrade/confirmed.
//
// ENV VARS REQUIRED (Vercel — public, safe to expose to browser):
//   NEXT_PUBLIC_PADDLE_CLIENT_TOKEN  — Paddle client-side token (clt_xxx)
//   NEXT_PUBLIC_PADDLE_ENVIRONMENT   — "sandbox" or "production"

import { Suspense } from "react";
import { CONFIG } from "@/app/lib/config";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = {
  title: `Checkout | ${CONFIG.appName}`,
  robots: { index: false, follow: false },
};

function CheckoutLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-qm-bg">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-qm-accent border-t-transparent" />
        <p className="mt-4 text-sm text-qm-faint">Preparing secure checkout…</p>
        <p className="mt-1 text-xs text-qm-faint">Powered by Paddle</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}
