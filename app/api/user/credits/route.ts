import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { ensureCreditsFresh } from "@/lib/creditRules";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerSupabase();

  // ✅ getSession reads from cookie locally — no network call
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json(
      { credits: 0, renewalDate: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  await ensureCreditsFresh({ supabase, userId: session.user.id });

  const { data, error } = await supabase
    .from("user_credits")
    .select("remaining_credits, renewal_date")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { credits: 0, renewalDate: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  const credits =
    typeof (data as any).remaining_credits === "number"
      ? (data as any).remaining_credits
      : 0;

  const renewalDate =
    typeof (data as any).renewal_date === "string"
      ? (data as any).renewal_date
      : null;

  return NextResponse.json(
    { credits, renewalDate },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
