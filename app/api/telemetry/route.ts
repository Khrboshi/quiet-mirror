/**
 * app/api/telemetry/route.ts
 *
 * POST — Generic server-side telemetry log.
 * Called by telemetry.ts when PostHog has not yet initialised on the client
 * (e.g. very early in the page lifecycle before hydration completes).
 *
 * Logs the event name + full payload to Vercel Runtime Logs so no signal
 * is silently discarded. PostHog is the primary path; this is a safety net.
 *
 * Accepts any event — does NOT filter by event name.
 * Never returns an error to the caller (204 always) to preserve app stability.
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let body: unknown = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const b = typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

    const event = typeof b.event === "string" ? b.event : "unknown";
    const data  = typeof b.data  === "object" && b.data !== null ? b.data : {};

    console.log("[telemetry:fallback]", {
      event,
      data,
      ts:      new Date().toISOString(),
      ua:      req.headers.get("user-agent") || null,
      referer: req.headers.get("referer")    || null,
    });
  } catch {
    // Never break the app because telemetry failed
  }
  return new NextResponse(null, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ ok: true, note: "Use POST" }, { status: 200 });
}
