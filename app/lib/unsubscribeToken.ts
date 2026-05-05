/**
 * app/lib/unsubscribeToken.ts
 *
 * Signs and verifies one-click unsubscribe tokens.
 *
 * Token format (URL-safe base64):  HMAC_HEX.base64url(email)
 *
 * - HMAC is over the raw email string using UNSUBSCRIBE_SECRET (env var).
 * - Falls back to NEXTAUTH_SECRET / a hard-coded dev-only string so local
 *   dev works without extra env setup, but the fallback logs a warning.
 * - Tokens do not expire — unsubscribing is a one-way, low-risk action.
 *   If the email address is re-added later it gets a fresh token.
 *
 * ENV VAR:
 *   UNSUBSCRIBE_SECRET  — 32+ random bytes (hex or base64), set in Vercel.
 *   Falls back to NEXTAUTH_SECRET for projects that already have one.
 */

import { createHmac } from "crypto";

function getSecret(): string {
  const s =
    process.env.UNSUBSCRIBE_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    null;

  if (!s) {
    console.warn(
      "[unsubscribeToken] UNSUBSCRIBE_SECRET not set — using insecure fallback. " +
        "Set UNSUBSCRIBE_SECRET in Vercel env vars before launch."
    );
    return "dev-only-insecure-fallback-do-not-use-in-production";
  }
  return s;
}

function hmac(email: string): string {
  return createHmac("sha256", getSecret()).update(email).digest("hex");
}

/** Returns a URL-safe token string for the given email address. */
export function signUnsubscribeToken(email: string): string {
  const sig = hmac(email);
  const enc = Buffer.from(email).toString("base64url");
  return `${sig}.${enc}`;
}

/**
 * Verifies a token and returns the email if valid, or null if tampered/malformed.
 * Uses a constant-time comparison to prevent timing attacks.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const dot = token.indexOf(".");
    if (dot === -1) return null;

    const sig = token.slice(0, dot);
    const enc = token.slice(dot + 1);

    const email = Buffer.from(enc, "base64url").toString("utf8");
    if (!email) return null;

    const expected = hmac(email);

    // Constant-time comparison
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) {
      diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    return diff === 0 ? email : null;
  } catch {
    return null;
  }
}
