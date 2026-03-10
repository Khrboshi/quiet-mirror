// app/api/email/subscribe/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body?.source === "string" ? body.source : "blog";

    // Basic validation
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Upsert — if already subscribed, just update source (don't error or leak)
    const { error } = await supabase
      .from("email_subscribers")
      .upsert(
        { email, source, subscribed_at: new Date().toISOString() },
        { onConflict: "email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("[email/subscribe] supabase error", error.message);
      // Still return 200 — don't expose DB errors to client
    }

    console.log("[email/subscribe] new subscriber", { email: email.slice(0, 4) + "***", source });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[email/subscribe] unexpected error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, note: "Use POST" });
}
