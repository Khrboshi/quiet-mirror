"use client";

import Link from "next/link";
import { useTranslation } from "@/app/components/I18nProvider";
import { useEffect, useMemo, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { useUserPlan } from "@/app/components/useUserPlan";
import { PAYMENT } from "@/app/lib/payment";

type InvoiceItem = {
  id: string;
  number: string | null;
  status: string | null;
  amount_paid: number | null;
  amount_due: number | null;
  currency: string | null;
  created: number; // unix seconds
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
};

function formatMoney(
  cents: number | null | undefined,
  currency: string | null | undefined
) {
  const cur = (currency || "usd").toUpperCase();
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${cur}`;
  }
}

function formatDateFromUnixSeconds(sec: number) {
  const d = new Date(sec * 1000);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function TransactionsPage() {
  const { session } = useSupabase();
  const { planType, credits, loading } = useUserPlan();
  const { t } = useTranslation();

  const email = session?.user?.email ?? "Unknown user";

  const readablePlan =
    planType === "PREMIUM" ? "Premium" : planType === "TRIAL" ? "Trial" : "Free";

  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  const goToPortal = () => {
    // IMPORTANT: full navigation (no fetch, no Link) to avoid CORS issues.
    window.location.href = PAYMENT.portalUrl("/settings/transactions");
  };

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setInvLoading(true);
        setInvError(null);

        const res = await fetch(PAYMENT.invoicesApiRoute, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Invoices request failed (${res.status})`);
        }

        const data = await res.json();
        const items = Array.isArray(data?.items) ? (data.items as InvoiceItem[]) : [];
        if (alive) setInvoices(items);
      } catch (e: any) {
        if (alive) setInvError(e?.message || t.errors.invoicesFailed);
      } finally {
        if (alive) setInvLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const showUpgrade = !loading && planType !== "PREMIUM";

  const totalPaid = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.amount_paid ?? 0), 0);
  }, [invoices]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 text-qm-primary">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight mb-2">Transactions</h1>
          <p className="text-qm-muted text-sm">{email}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-qm-primary hover:bg-white/10"
          >
            Back to Settings
          </Link>
          <Link
            href="/settings/billing"
            className="rounded-full bg-qm-positive-strong px-3 py-2 text-sm font-medium text-black hover:bg-qm-positive"
          >
            Billing
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>

          {loading ? (
            <p className="text-qm-muted">Loading…</p>
          ) : (
            <p className="text-qm-muted">
              Plan: <span className="text-qm-primary">{readablePlan}</span>
              {planType !== "PREMIUM" ? (
                <>
                  {" "}
                  — credits: <span className="text-qm-primary">{credits ?? 0}</span>
                </>
              ) : null}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={goToPortal}
              className="rounded-full bg-qm-positive-strong px-4 py-2 text-sm font-medium text-black hover:bg-qm-positive"
            >
              Manage subscription
            </button>

            {showUpgrade ? (
              <Link
                href="/upgrade"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-qm-primary hover:bg-white/10"
              >
                Upgrade
              </Link>
            ) : null}

            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-qm-primary hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>

          <p className="mt-4 text-xs text-qm-faint">{PAYMENT.billingManagedLine}</p>
        </div>

        {/* Payment history */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold">Payment history</h2>
            <div className="text-xs text-qm-muted">
              Total paid:{" "}
              <span className="text-qm-primary">
                {formatMoney(totalPaid, invoices[0]?.currency || "usd")}
              </span>
            </div>
          </div>

          {invLoading ? (
            <p className="text-qm-muted">Loading invoices…</p>
          ) : invError ? (
            <div className="rounded-xl border border-qm-danger-border bg-qm-danger-soft p-4 text-sm text-qm-danger">
              {invError}
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-qm-muted">{t.settingsPage.noInvoicesYet}</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-white/5 text-qm-muted">
                  <tr>
                    <th className="text-start font-medium px-4 py-3">{t.settingsPage.colDate}</th>
                    <th className="text-start font-medium px-4 py-3">{t.settingsPage.colStatus}</th>
                    <th className="text-end font-medium px-4 py-3">{t.settingsPage.colAmount}</th>
                    <th className="text-end font-medium px-4 py-3">{t.settingsPage.colReceipt}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const url = inv.hosted_invoice_url || inv.invoice_pdf;
                    const amount =
                      (inv.amount_paid && inv.amount_paid > 0
                        ? inv.amount_paid
                        : inv.amount_due) ?? 0;

                    return (
                      <tr key={inv.id} className="border-t border-white/10">
                        <td className="px-4 py-3 text-qm-primary">
                          {formatDateFromUnixSeconds(inv.created)}
                        </td>
                        <td className="px-4 py-3 text-qm-secondary capitalize">
                          {inv.status || "-"}
                        </td>
                        <td className="px-4 py-3 text-end text-qm-primary">
                          {formatMoney(amount, inv.currency)}
                        </td>
                        <td className="px-4 py-3 text-end">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-qm-positive hover:text-qm-positive-hover"
                            >
                              {t.settingsPage.viewLabel}
                            </a>
                          ) : (
                            <span className="text-qm-faint">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={goToPortal}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-qm-primary hover:bg-white/10"
            >
              {PAYMENT.portalLabel}
            </button>

            <Link
              href="/settings/billing"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-qm-primary hover:bg-white/10"
            >
              Go to Billing page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
