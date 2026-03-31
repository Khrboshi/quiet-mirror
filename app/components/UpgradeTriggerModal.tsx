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

  const finalCtaLabel = ctaLabel ?? cta ?? `Start ${PRICING.trialLabel} →`;
  const finalCtaHref = ctaHref ?? "/upgrade";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" style={{ backgroundColor: "rgba(10, 13, 26, 0.75)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] qm-panel-strong shadow-qm-soft">
        {/* Header with emerald tint */}
        <div className="border-b border-qm-card bg-qm-card px-6 py-5">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-qm-accent bg-qm-accent-soft px-2.5 py-1 text-[11px] font-semibold text-qm-accent">
            ✦ Premium feature
          </span>
          <h3 className="font-display text-xl font-semibold text-qm-primary">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-qm-secondary">
            {finalDescription}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* What you get */}
          <div className="space-y-2.5">
            {[
              { label: "Unlimited reflections", dot: "bg-qm-accent" },
              { label: "Pattern insights across time", dot: "bg-qm-premium" },
              { label: "Weekly personal summary", dot: "bg-qm-warning" },
            ].map(({ label, dot }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <span className="text-sm text-qm-secondary">{label}</span>
              </div>
            ))}
          </div>

          {/* Price line */}
          <div className="mt-5 qm-panel flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl px-4 py-3">
            <span className="font-display text-2xl font-bold text-qm-primary">
              {PRICING.monthly}
            </span>
            <span className="text-sm text-qm-secondary">/ month</span>
            <span className="rounded-full border border-qm-accent bg-qm-accent-soft px-2 py-0.5 text-[10px] font-medium text-qm-accent">
              {PRICING.valueLabel}
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href={finalCtaHref}
              className="inline-flex w-full items-center justify-center rounded-full qm-btn-primary px-5 py-3 text-sm"
            >
              {finalCtaLabel}
            </Link>

            <Link
              href="/insights/preview"
              className="inline-flex w-full items-center justify-center rounded-full qm-btn-secondary px-5 py-2.5 text-sm"
            >
              Preview what Premium shows
            </Link>
          </div>

          {/* Trust + dismiss */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-qm-faint">
              🛡️ {PRICING.trialFreeFor} ·{" "}
              <Link
                href="/terms"
                className="underline underline-offset-2 transition-colors hover:text-qm-muted"
              >
                Terms
              </Link>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-qm-muted transition-colors hover:text-qm-secondary"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
