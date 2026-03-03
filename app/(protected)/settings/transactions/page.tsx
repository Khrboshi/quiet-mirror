// app/(protected)/settings/transactions/page.tsx
"use client";

import Link from "next/link";
import { useSupabase } from "@/components/SupabaseSessionProvider";
import { useUserPlan } from "@/app/components/useUserPlan";

export default function TransactionsPage() {
  const { session } = useSupabase();
  const { planType, credits, loading } = useUserPlan();

  const email = session?.user?.email ?? "Unknown user";

  const readablePlan =
    planType === "PREMIUM"
      ? "Premium"
      : planType === "TRIAL"
      ? "Trial"
      : "Free";

  const isPremium = planType === "PREMIUM";

  return (
    <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-slate-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Transactions
          </h1>
          <p className="text-slate-400 text-sm">{email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings"
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Back to Settings
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Billing
          </Link>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>

          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-400">
                Plan: <span className="text-slate-200">{readablePlan}</span>
              </p>

              {!isPremium && (
                <p className="text-slate-400">
                  Credits:{" "}
                  <span className="text-slate-200">{credits ?? 0}</span>
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {isPremium ? (
              <a
                href="/api/stripe/portal?returnUrl=/settings/transactions"
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
              >
                Manage subscription
              </a>
            ) : (
              <Link
                href="/upgrade"
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
              >
                Upgrade
              </Link>
            )}

            <Link
              href="/dashboard"
              className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Premium billing is managed securely in Stripe. Use “Manage
            subscription” to view invoices, update payment method, or cancel.
          </p>
        </div>

        {/* Payment history */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-2">Payment history</h2>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-slate-300 text-sm font-medium mb-1">
              Invoices and receipts
            </p>
            <p className="text-slate-400 text-sm">
              For now, invoices are available in the Stripe customer portal.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/api/stripe/portal?returnUrl=/settings/transactions"
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Open Stripe portal
              </a>

              <Link
                href="/settings/billing"
                className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Go to Billing page
              </Link>
            </div>
          </div>

          <div className="mt-5 text-xs text-slate-500">
            If you want invoices to appear here (inside Havenly), we can add an
            API endpoint that lists Stripe invoices for the logged-in user and
            render them as a table.
          </div>
        </div>
      </div>
    </div>
  );
}
