// app/api/paddle/transactions/route.ts
// Returns the user's Paddle transaction history (equivalent to Stripe invoices).
// Invoice PDF URLs are fetched via the Paddle API (signed, expire after ~1 hour).

import { NextResponse } from "next/server";
import { Paddle, Environment } from "@paddle/paddle-node-sdk";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getPaddle() {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY is not set");
  return new Paddle(key, {
    environment:
      process.env.PADDLE_ENVIRONMENT === "sandbox"
        ? Environment.sandbox
        : Environment.production,
  });
}

export async function GET() {
  try {
    const supabase = createServerSupabase();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profErr) {
      console.error("[paddle/transactions] profiles read error:", profErr);
      return NextResponse.json({ error: "Transactions error" }, { status: 500 });
    }

    const customerId = profile?.paddle_customer_id;
    if (!customerId) {
      // No Paddle billing history yet — return empty list gracefully
      return NextResponse.json({ items: [] });
    }

    const paddle = getPaddle();

    // TransactionCollection is an AsyncIterable — collect first page via next()
    const collection = paddle.transactions.list({
      customerId: [customerId],
      perPage: 20,
    });

    const page = await collection.next();

    // Fetch invoice PDF URLs via API — cannot be constructed manually.
    // URLs are signed and expire after ~1 hour so we fetch on demand.
    const items = await Promise.all(
      (page ?? []).map(async (tx) => {
        let invoiceUrl: string | null = null;
        if (tx.invoiceNumber) {
          try {
            const pdf = await paddle.transactions.getInvoicePDF(tx.id);
            invoiceUrl = pdf.url ?? null;
          } catch (e) {
            console.error(`[paddle/transactions] failed to get invoice for ${tx.id}:`, e);
          }
        }

        return {
          id:         tx.id,
          status:     tx.status,
          currency:   tx.currencyCode,
          amount:     tx.details?.totals?.total ?? "0",
          created:    tx.createdAt,
          invoiceUrl,
        };
      })
    );

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("[paddle/transactions] error:", e?.message || e);
    return NextResponse.json({ error: "Transactions error" }, { status: 500 });
  }
}
