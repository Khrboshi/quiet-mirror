"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError("No checkout URL returned. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Redirecting to checkout..." : "Upgrade to Premium"}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
