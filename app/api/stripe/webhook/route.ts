// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { setUserPlan } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

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
        const session = event.data.object as Stripe.CheckoutSession;
        const userId = session.client_reference_id;

        if (!userId) {
          console.error("[webhook] checkout.session.completed - no user ID");
          break;
        }

        const supabase = createAdminSupabase();
        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });

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
        await setUserPlan({ supabase: supabase as any, userId, planType: "PREMIUM" });
        console.log("[webhook] renewed PREMIUM for user:", userId);
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
        await setUserPlan({ supabase: supabase as any, userId, planType: "FREE" });
        console.log("[webhook] downgraded user to FREE:", userId);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
