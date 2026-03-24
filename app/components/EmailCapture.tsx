// app/components/EmailCapture.tsx
"use client";

import { useState } from "react";
import { CONFIG } from "@/app/lib/config";

type Variant = "blog-index" | "article-inline";

export default function EmailCapture({ source = "blog", variant = "blog-index" }: {
  source?: string;
  variant?: Variant;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit() {
    if (!email || status === "loading") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (variant === "article-inline") {
    return (
      <div className="my-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
        {status === "success" ? (
          <div className="py-2 text-center">
            <p className="text-sm font-medium text-emerald-400">You&apos;re in.</p>
            <p className="mt-1 text-xs text-slate-500">One quiet article a week, whenever it&apos;s ready.</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-200">
              One quiet article a week.
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              No noise, no streak guilt. Just something worth reading when it&apos;s ready.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40"
              />
              <button
                onClick={handleSubmit}
                disabled={!email || status === "loading"}
                className="shrink-0 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {status === "loading" ? "…" : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-2 text-xs text-red-400">Something went wrong. Try again.</p>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Blog index variant — full-width section card ──
  return (
    <div className="rounded-[1.8rem] border border-emerald-500/15 bg-emerald-500/[0.03] p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
            {CONFIG.newsletterName}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug text-white">
            One quiet article a week.
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            No streak guilt. No noise. Just one piece worth reading, whenever it&apos;s ready. Unsubscribe in one click.
          </p>
        </div>

        {status === "success" ? (
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <p className="text-sm font-semibold text-emerald-400">You&apos;re in. ✓</p>
            <p className="text-xs text-slate-600">Look out for the next article.</p>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="your@email.com"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40"
              />
              <button
                onClick={handleSubmit}
                disabled={!email || status === "loading"}
                className="shrink-0 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {status === "loading" ? "…" : "Subscribe"}
              </button>
            </div>
            {status === "error" && (
              <p className="mt-1 pl-2 text-xs text-red-400">Something went wrong. Try again.</p>
            )}
            <p className="pl-2 text-[11px] text-slate-700">
              No spam. No selling. One click to leave.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
