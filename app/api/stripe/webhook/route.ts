/**
 * app/api/stripe/webhook/route.ts
 *
 * Legacy Stripe webhook handler — processes events for subscribers who joined
 * before the Dodo Payments migration. Must remain active until all pre-migration
 * Stripe subscriptions have lapsed or been cancelled.
 *
 * New subscribers use Dodo Payments (/api/dodo/webhook).
 *
 * EVENTS HANDLED:
 *   checkout.session.completed      → PREMIUM (initial subscription)
 *   customer.subscription.updated   → FREE if past_due/unpaid; PREMIUM if active
 *   customer.subscription.deleted   → FREE (final cancellation / expiry)
 *
 * ENV VARS REQUIRED (Vercel):
 *   STRIPE_SECRET_KEY       — sk_live_*
 *   STRIPE_WEBHOOK_SECRET   — whsec_*
 */
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { setUserPlan } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function createAdminSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === "placeholder") {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[webhook] signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 400 }
    );
  }

  async function resolveUserId(
    subscription: Stripe.Subscription
  ): Promise<string | null> {
    const fromSub = subscription.metadata?.supabase_user_id;
    if (fromSub) return fromSub;

    try {
      const sessions = await stripe.checkout.sessions.list({
        subscription: subscription.id,
        limit: 1,
      });
      const ref = sessions.data[0]?.client_reference_id;
      if (ref) return ref;
    } catch {}

    return null;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        // IMPORTANT: fail loudly so Stripe can retry / you can diagnose config issues
        if (!userId) {
          console.error("[webhook] checkout.session.completed - no user ID");
          return NextResponse.json(
            { error: "Missing client_reference_id (userId)" },
            { status: 400 }
          );
        }

        const supabase = createAdminSupabase();
        await setUserPlan({
          supabase: supabase as any,
          userId,
          planType: "PREMIUM",
        });

        if (session.customer) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: String(session.customer) })
            .eq("id", userId);
        }

        console.log("[webhook] upgraded user to PREMIUM:", userId);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = await resolveUserId(subscription);

        if (!userId) {
          console.error("[webhook] invoice.paid - no user ID for sub:", subId);
          break;
        }

        const supabase = createAdminSupabase();
        await setUserPlan({
          supabase: supabase as any,
          userId,
          planType: "PREMIUM",
        });
        console.log("[webhook] renewed PREMIUM for user:", userId);
        break;
      }

      // FIX Issue 7: handle subscription moving to past_due / unpaid before it's deleted.
      // Stripe may take days to fire subscription.deleted after a failed payment.
      // This ensures the user is downgraded at the first sign of a payment problem.
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const previousStatus = (event.data.previous_attributes as any)?.status;
        const currentStatus = subscription.status;

        // Only act if status changed to a delinquent state
        const isNowDelinquent =
          currentStatus === "past_due" || currentStatus === "unpaid";
        const wasActiveOrTrialing =
          previousStatus === "active" || previousStatus === "trialing";

        if (!isNowDelinquent || !wasActiveOrTrialing) break;

        const userId = await resolveUserId(subscription);
        if (!userId) {
          console.error("[webhook] subscription.updated - no user ID for sub:", subscription.id);
          break;
        }

        const supabase = createAdminSupabase();
        await setUserPlan({
          supabase: supabase as any,
          userId,
          planType: "FREE",
        });
        console.log(
          `[webhook] downgraded user to FREE (status: ${currentStatus}):`,
          userId
        );
        break;
      }

      case "customer.subscription.deleted":
      case "invoice.payment_failed": {
        let subId: string | null = null;

        if (event.type === "customer.subscription.deleted") {
          subId = (event.data.object as Stripe.Subscription).id;
        } else {
          const invoice = event.data.object as Stripe.Invoice;
          subId = invoice.subscription as string;
        }

        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(subId);
        const userId = await resolveUserId(subscription);

        if (!userId) {
          console.error("[webhook] downgrade - no user ID for sub:", subId);
          break;
        }

        const supabase = createAdminSupabase();
        await setUserPlan({
          supabase: supabase as any,
          userId,
          planType: "FREE",
        });
        console.log("[webhook] downgraded user to FREE:", userId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // IMPORTANT: return non-2xx so Stripe retries instead of silently dropping the event
    console.error("[webhook] handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
