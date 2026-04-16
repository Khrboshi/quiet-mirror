// app/api/dodo/transactions/route.ts
// Returns the user's Dodo payment history for display on the billing page.
//
// ENV VARS REQUIRED (Vercel):
//   DODO_PAYMENTS_API_KEY     — Dodo secret API key
//   DODO_PAYMENTS_ENVIRONMENT — "test_mode" | "live_mode"

import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
// PaymentListResponse is the SDK's type for each item returned by payments.list().
// Despite the name, it represents a single payment element, not the list wrapper —
// confirmed by DefaultPageNumberPagination<PaymentListResponse> in the SDK source.
import type { PaymentListResponse } from "dodopayments/resources/payments.js";
/** A single element from page.items in the payments list response */
type PaymentItem = PaymentListResponse;
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getDodo() {
  const key = process.env.DODO_PAYMENTS_API_KEY;
  if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not set");
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT;
  if (env !== "live_mode" && env !== "test_mode") {
    throw new Error(
      `DODO_PAYMENTS_ENVIRONMENT must be "live_mode" or "test_mode", got: "${env ?? "undefined"}"`
    );
  }
  return new DodoPayments({ bearerToken: key, environment: env });
}

export async function GET() {
  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("dodo_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("[dodo/transactions] profiles read error:", profErr);
      return NextResponse.json({ error: "Transactions error" }, { status: 500 });
    }

    const customerId = profile?.dodo_customer_id;
    if (!customerId) {
      // No Dodo billing history yet — return empty list gracefully
      return NextResponse.json({ items: [] });
    }

    const dodo = getDodo();

    const page = await dodo.payments.list({ customer_id: customerId, page_size: 20 });

    // Normalize to the InvoiceItem shape consumed by
    // app/(protected)/settings/transactions/page.tsx
    const items = (page.items ?? []).map((payment: PaymentItem) => ({
      id:                payment.payment_id ?? null,
      number:            payment.payment_id ?? null,
      status:            payment.status     ?? null,
      currency:          payment.currency   ?? null,
      // amount_paid / amount_due: Dodo returns in smallest currency unit (cents)
      amount_paid:       payment.total_amount ?? null,
      amount_due:        payment.total_amount ?? null,
      // created: billing page expects unix seconds — convert ISO string
      created:           payment.created_at
                           ? Math.floor(new Date(payment.created_at).getTime() / 1000)
                           : 0,
      hosted_invoice_url: payment.invoice_url ?? null,
      invoice_pdf:        null, // Dodo does not expose a separate PDF URL
    }));

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[dodo/transactions] error:", msg, e);
    return NextResponse.json({ error: "Transactions error" }, { status: 500 });
  }
}
