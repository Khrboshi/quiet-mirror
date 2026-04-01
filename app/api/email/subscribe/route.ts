// app/api/email/subscribe/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { Resend } from "resend";
import { CONFIG } from "@/app/lib/config";
import { getLocaleFromCookieString, getDir, getTranslations } from "@/app/lib/i18n";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ADDRESS = CONFIG.emailFromAddress;

// Rate limit: max 3 subscribe attempts per IP per hour
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const supabase = createServerSupabase();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count, error } = await supabase
      .from("email_subscribe_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", windowStart);

    if (error) return false;
    return (count ?? 0) >= RATE_LIMIT_MAX;
  } catch {
    return false;
  }
}

async function recordAttempt(ip: string): Promise<void> {
  try {
    const supabase = createServerSupabase();
    await supabase
      .from("email_subscribe_attempts")
      .insert({ ip, created_at: new Date().toISOString() });
  } catch {
    // best-effort, non-blocking
  }
}

function confirmationEmailHtml(locale: string, dir: "ltr" | "rtl"): string {
  const e = getTranslations(locale).email;
  return `
<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${e.confirmTitle(CONFIG.newsletterName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:'DM Sans',system-ui,sans-serif;color:#cbd5e1;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:18px;font-weight:700;color:#f8fafc;letter-spacing:-0.02em;">${CONFIG.appName}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:16px;">
              <h1 style="margin:0;font-size:26px;font-weight:600;line-height:1.2;color:#f8fafc;letter-spacing:-0.02em;">
                ${e.confirmHeading}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:15px;line-height:1.7;color:#94a3b8;">
                ${e.confirmBody}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <div style="height:1px;background-color:#1e293b;"></div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#475569;">${e.whatToExpectLabel}</p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#64748b;">
                ${e.whatToExpectBody}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:40px;">
              <a href="${CONFIG.siteUrl}/blog" style="display:inline-block;background-color:#7c9fff;color:#0b1120;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;border-radius:9999px;">
                ${e.readLatestCta}
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#334155;">
                ${e.footerLine1(CONFIG.appName)}<br />
                ${e.footerLine2}<br />
                <a href="${CONFIG.siteUrl}/privacy" style="color:#475569;">${e.privacyPolicy}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export async function POST(req: Request) {
  const locale = getLocaleFromCookieString(req.headers.get("cookie") ?? "");
  const dir    = getDir(locale);
  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source = typeof body?.source === "string" ? body.source : "blog";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    // Rate limit by IP
    const ip = getClientIp(req);
    const limited = await isRateLimited(ip);
    if (limited) {
      return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
    }
    await recordAttempt(ip);

    const supabase = createServerSupabase();

    const { error: dbError, data: upsertData } = await supabase
      .from("email_subscribers")
      .upsert(
        { email, source, subscribed_at: new Date().toISOString() },
        { onConflict: "email", ignoreDuplicates: true }
      )
      .select();

    if (dbError) {
      console.error("[email/subscribe] supabase error", dbError.message);
    }

    const isNewSubscriber = Array.isArray(upsertData) && upsertData.length > 0;

    if (isNewSubscriber) {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) {
        console.error("[email/subscribe] RESEND_API_KEY not set");
      } else {
        const resend = new Resend(resendKey);
        const { error: emailError } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: email,
          subject: CONFIG.emailConfirmSubject,
          html: confirmationEmailHtml(locale, dir),
        });
        if (emailError) {
          console.error("[email/subscribe] resend error", emailError);
        } else {
          console.log("[email/subscribe] confirmation sent to", email.slice(0, 4) + "***");
        }
      }
    }

    console.log("[email/subscribe] processed", { email: email.slice(0, 4) + "***", source, isNew: isNewSubscriber });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[email/subscribe] unexpected error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, note: "Use POST" });
}
