"use client";

import Link from "next/link";
import { useEffect } from "react";

export interface UpgradeTriggerModalProps {
  open: boolean;
  onClose: () => void;

  // Title
  title?: string;

  // Backward/forward compatible message fields
  // Some callers use `message`, others use `description`
  message?: string;
  description?: string;

  // CTA (some callers pass ctaLabel/ctaHref, others pass cta)
  ctaLabel?: string;
  ctaHref?: string;
  cta?: string;

  // Optional analytics/source tag used by callers
  source?: string;
}

export default function UpgradeTriggerModal({
  open,
  onClose,
  title = "Upgrade to continue",
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
    "You’ve reached your limit. Upgrade to unlock more entries and reflections.";

  const finalCtaLabel = ctaLabel ?? cta ?? "Upgrade now";
  const finalCtaHref = ctaHref ?? "/upgrade";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#020617] p-6 text-slate-200 shadow-2xl">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{finalDescription}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-2">
            <span className="text-sm text-slate-300">$30<span className="text-slate-500">/month</span></span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-400">7-day full refund guarantee</span>
            <span className="text-slate-700">·</span>
            <span className="text-xs text-slate-400">Cancel anytime</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href={finalCtaHref}
            className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            {finalCtaLabel}
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
