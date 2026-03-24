"use client";

import Link from "next/link";
import { useEffect } from "react";
import { PRICING } from "@/app/lib/pricing";

export interface UpgradeTriggerModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  cta?: string;
  source?: string;
}

export default function UpgradeTriggerModal({
  open,
  onClose,
  title = "You've used your free reflections this month.",
  message,
  description,
  ctaLabel,
  ctaHref,
  cta,
  source,
}: UpgradeTriggerModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const finalDescription =
    message ??
    description ??
    "Premium unlocks unlimited reflections, pattern insights across time, and a weekly summary of what Quiet Mirror noticed.";

  const finalCtaLabel = ctaLabel ?? cta ?? "Start 7-day free trial →";
  const finalCtaHref = ctaHref ?? "/upgrade";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-emerald-500/20 bg-slate-950 shadow-2xl shadow-black/60">
        {/* Header with emerald tint */}
        <div className="border-b border-emerald-500/10 bg-emerald-500/[0.03] px-6 py-5">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
            ✦ Premium feature
          </span>
          <h3 className="font-display text-xl font-semibold text-white">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            {finalDescription}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* What you get */}
          <div className="space-y-2.5">
            {[
              { label: "Unlimited reflections", dot: "bg-emerald-400" },
              { label: "Pattern insights across time", dot: "bg-violet-400" },
              { label: "Weekly personal summary", dot: "bg-amber-400" },
            ].map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          {/* Price line */}
          <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] px-4 py-3">
            <span className="font-display text-2xl font-bold text-white">
              {PRICING.monthly}
            </span>
            <span className="text-sm text-slate-400">/ month</span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              {PRICING.valueLabel}
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={finalCtaHref}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
            >
              {finalCtaLabel}
            </Link>

            <Link
              href="/insights/preview"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-700/60 px-5 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
            >
              Preview what Premium shows
            </Link>
          </div>

          {/* Trust + dismiss */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-700">
              🛡️ No charge for 7 days ·{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-slate-500"
              >
                Terms
              </Link>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-600 transition-colors hover:text-slate-400"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
