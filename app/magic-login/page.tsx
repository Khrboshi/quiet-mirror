/**
 * app/magic-login/page.tsx
 *
 * Passwordless authentication entry point — handles both the email submission
 * step and the OTP verification step in a single client component.
 *
 * Flow:
 * 1. User enters email → sendMagicLink() → Supabase sends OTP email
 * 2. User enters 6-digit OTP → verifyOtp() → Supabase session created
 * 3. On success: router.push() to /dashboard (or ?next= param if present)
 *
 * Also handles the magic link click path: Supabase redirects to
 * /auth/callback which exchanges the token, then redirects here with
 * the session already established.
 */
"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { sendMagicLink } from "./sendMagicLink";
import { CONFIG } from "@/app/lib/config";
import { verifyOtp } from "./verifyOtp";
import { getTranslations } from "@/app/lib/i18n";
import { useTranslation } from "@/app/components/I18nProvider";
import { track } from "@/app/components/telemetry";

type Status = "idle" | "loading" | "success" | "error";
type Mode = "link" | "code";

function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches === true ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function safeNext(raw: string | null | undefined): string {
  const v = (raw || "/dashboard").trim();
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

// Quotes come from i18n — edit in app/lib/i18n/en.ts / uk.ts / ar.ts
function getSideQuotes(ml: ReturnType<typeof getTranslations>["magicLogin"]) {
  return [
    { text: ml.quote1 },
    { text: ml.quote2 },
    { text: ml.quote3 },
    { text: ml.quote4 },
    { text: ml.quote5 },
  ];
}

function MagicLoginInner() {
  const router = useRouter();
  const { session } = useSupabase();
  const { t } = useTranslation();
  const ml  = t.magicLogin;      // quotes + send/verify messages
  const mlp = t.magicLoginPage;  // UI labels, headings, button text
  const SIDE_QUOTES = getSideQuotes(ml);

  const [paramsReady, setParamsReady]     = useState(false);
  const [next, setNext]                   = useState("/dashboard");
  const [callbackError, setCallbackError] = useState(false);
  const [isReturning, setIsReturning]     = useState(false);
  const [ios, setIos]                     = useState(false);
  const [standalone, setStandalone]       = useState(false);
  const [quoteIndex, setQuoteIndex]       = useState(0);
  const [mode, setMode]                   = useState<Mode>("link");
  const [status, setStatus]               = useState<Status>("idle");
  const [message, setMessage]             = useState<string | null>(null);
  const [email, setEmail]                 = useState("");
  const [token, setToken]                 = useState("");

  const sideQuote = SIDE_QUOTES[quoteIndex] ?? SIDE_QUOTES[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const parsedNext          = safeNext(sp.get("next"));
    const parsedCallbackError = sp.get("callback_error") === "1";
    const parsedReturning     = sp.get("logged_out") === "1" || sp.get("returning") === "1";
    const deviceIsIOS         = isIOS();
    const appIsStandalone     = isStandalone();
    setNext(parsedNext);
    setCallbackError(parsedCallbackError);
    setIsReturning(parsedReturning);
    setIos(deviceIsIOS);
    setStandalone(appIsStandalone);
    setMode(deviceIsIOS ? "code" : "link");
    setQuoteIndex(Math.floor(Math.random() * SIDE_QUOTES.length));
    setParamsReady(true);
  }, []);

  const goNext = useCallback(
    (target?: string) => { window.location.assign(safeNext(target ?? next)); },
    [next]
  );

  useEffect(() => {
    if (!paramsReady) return;
    if (session?.user) router.replace(next);
  }, [session?.user, router, next, paramsReady]);

  useEffect(() => {
    if (!callbackError) return;
    setMode("code");
    setStatus("error");
    setMessage(ml.callbackError);
  }, [callbackError]);

  useEffect(() => {
    const STORAGE_KEY = "havenly:auth_complete";
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try { goNext(JSON.parse(e.newValue)?.next); } catch { goNext(); }
    };
    window.addEventListener("storage", onStorage);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("havenly_auth");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "AUTH_COMPLETE") goNext(ev.data?.next);
      };
    } catch {}
    return () => {
      window.removeEventListener("storage", onStorage);
      try { bc?.close(); } catch {}
    };
  }, [goNext]);

  useEffect(() => {
    if (!paramsReady) return;
    try { window.localStorage.setItem("havenly:auth_next", next); } catch {}
  }, [next, paramsReady]);

  async function onSendEmail() {
    setStatus("loading");
    setMessage(null);
    try { window.localStorage.setItem("havenly:auth_next", next); } catch {}
    // Fire before the API call so we capture intent even if the request fails.
    // Guard: only fire on the first submission attempt — not on re-sends after
    // a successful email delivery (status === "success" means email already sent).
    if (status !== "success") {
      track("signup_attempted", { mode });
    }
    const fd = new FormData();
    fd.set("email", email);
    const res = await sendMagicLink(fd);
    if (!res.success) {
      setStatus("error");
      setMessage(res.message || ml.sendFailed);
      return;
    }
    // Supabase OTP doesn't reveal whether the email is new or returning —
    // that would require a separate DB lookup. Omitting is_new_user intentionally.
    track("signup_email_sent", { mode });
    setStatus("success");
    setMessage(mode === "code" ? ml.emailSentCode : ml.emailSentLink);
  }

  async function onVerifyCode() {
    setStatus("loading");
    setMessage(null);
    const fd = new FormData();
    fd.set("email", email);
    fd.set("token", token);
    const res = await verifyOtp(fd);
    if (!res.success) {
      setStatus("error");
      setMessage(res.message || ml.invalidCode);
      return;
    }
    goNext();
  }

  const digitsOnlyToken = token.replace(/\D/g, "");
  const tokenOk = digitsOnlyToken.length >= 6 && digitsOnlyToken.length <= 8;

  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      <div className="mx-auto w-full max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">

        {/* ── Left column ── */}
        <div className="hidden lg:flex lg:flex-col lg:justify-start">
          <div className="mb-8 flex items-center gap-2.5">
            <Image src="/pwa/icon-192.png" alt={CONFIG.appName} width={32} height={32} className="rounded-xl" priority />
            <span className="font-brand-name text-sm font-semibold text-qm-secondary">{CONFIG.appName}</span>
          </div>

          <h1 className="font-display max-w-sm text-4xl font-semibold leading-[1.1] tracking-tight text-qm-primary">
            {isReturning ? (
              <>{mlp.returningGreeting}<br /><span className="text-qm-faint">{mlp.returningWaiting}</span></>
            ) : (
              <>{mlp.newGreeting}<br /><span className="text-qm-faint">{mlp.newTagline}</span></>
            )}
          </h1>

          <div className="mt-8 max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-5">
            <p className="text-base italic leading-relaxed text-qm-secondary">&ldquo;{sideQuote.text}&rdquo;</p>
          </div>

          {!isReturning && (
            <ul className="mt-7 max-w-xs space-y-3">
              {[mlp.feat1, mlp.feat2, mlp.feat3].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-qm-muted">
                  <span className="mt-0.5 shrink-0 text-qm-positive">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 max-w-xs text-xs leading-relaxed text-qm-faint">
            {mlp.feat1}
          </p>

          <Link href="/" className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-qm-faint transition-colors hover:text-qm-muted">
            {mlp.backToHome}
          </Link>
        </div>

        {/* ── Right column — form ── */}
        <div className="w-full">
          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-qm-elevated p-6 shadow-qm-card backdrop-blur sm:p-7">

            {/* Mobile header */}
            <div className="mb-5 lg:hidden">
              <div className="mb-4 flex items-center gap-2">
                <Image src="/pwa/icon-192.png" alt={CONFIG.appName} width={28} height={28} className="rounded-lg" />
                <span className="font-brand-name text-sm font-semibold text-qm-secondary">{CONFIG.appName}</span>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-qm-primary">
                {isReturning ? mlp.returningGreeting : mlp.newGreeting}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-qm-muted">
                {isReturning ? mlp.returningWaiting : mlp.newTagline}
              </p>
            </div>

            {/* Desktop card header */}
            <div className="mb-5 hidden lg:block">
              <h2 className="font-display text-2xl font-semibold text-qm-primary">
                {isReturning ? mlp.ctaReturning : mlp.ctaNew}
              </h2>
              <p className="mt-1 text-sm text-qm-faint">
                {ios ? mlp.codeHint : isReturning ? mlp.deviceHint : mlp.noPasswordHint}
              </p>
            </div>

            {standalone && (
              <div className="mb-5 rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.06] p-4 text-sm leading-relaxed text-qm-positive">
                {mlp.codeHint}
              </div>
            )}

            {message && (
              <div className={`mb-5 rounded-2xl border p-4 text-sm leading-relaxed ${
                status === "success" ? "border-qm-positive-border bg-qm-positive-strong/[0.06] text-qm-positive"
                : status === "error"  ? "border-qm-danger-border bg-qm-danger-strong/[0.06] text-qm-danger"
                : "border-white/10 bg-white/[0.03] text-qm-primary"}`}>
                {message}
              </div>
            )}

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-qm-border-card bg-qm-card p-1.5">
              {(["code", "link"] as Mode[]).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                    mode === m ? "bg-white/10 text-qm-primary shadow-sm" : "text-qm-muted hover:text-qm-primary"}`}>
                  {m === "code" ? mlp.codeLabel : mlp.linkLabel}
                  <span className="mt-0.5 block text-[11px] font-normal text-qm-faint">
                    {m === "code" ? mlp.codeBest : mlp.linkBest}
                  </span>
                </button>
              ))}
            </div>

            {/* Email input */}
            <div className="mt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-faint">
                {mlp.emailAddressLabel}
              </label>
              <input required type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && email && mode === "link") onSendEmail(); }}
                placeholder={t.ui.emailPlaceholder}
                className="w-full rounded-2xl border border-qm-border-card bg-qm-elevated px-4 py-3 text-sm text-qm-primary outline-none transition placeholder:text-qm-muted focus:border-[color:var(--qm-accent)]"
              />
            </div>

            {mode === "link" ? (
              <div className="mt-5">
                <button type="button" onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
                  {status === "loading" ? mlp.sending : mlp.sendLink}
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <button type="button" onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
                  {status === "loading" ? mlp.sending : mlp.sendEmail}
                </button>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-faint">
                    Code from email
                  </label>
                  <input value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onKeyDown={(e) => { if (e.key === "Enter" && tokenOk) onVerifyCode(); }}
                    inputMode="numeric"
                    placeholder={mlp.codePlaceholder}
                    className="w-full rounded-2xl border border-qm-border-card bg-qm-elevated px-4 py-3 text-sm text-qm-primary outline-none transition placeholder:text-qm-muted focus:border-[color:var(--qm-accent)]"
                  />
                  <button type="button" onClick={onVerifyCode}
                    disabled={status === "loading" || !email || !tokenOk}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-qm-primary transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60">
                    {status === "loading" ? mlp.verifying : mlp.verify}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-2 text-center lg:hidden">
              <Link href="/" className="text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover">
                {mlp.backToHome}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return <MagicLoginInner />;
}
