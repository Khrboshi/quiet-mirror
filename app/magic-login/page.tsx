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

const SIDE_QUOTES = [
  { text: "You don't have to have it figured out to write it down." },
  { text: "Something is trying to become clear. Writing helps." },
  { text: "Your journal isn't judging you. It's just listening." },
  { text: "The patterns you can't see yet are already in what you've written." },
  { text: "Coming back is the whole practice." },
];

function MagicLoginInner() {
  const router = useRouter();
  const { session } = useSupabase();

  const [paramsReady, setParamsReady] = useState(false);
  const [next, setNext] = useState("/dashboard");
  const [callbackError, setCallbackError] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const [mode, setMode] = useState<Mode>("link");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const sideQuote = SIDE_QUOTES[quoteIndex] ?? SIDE_QUOTES[0];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sp = new URLSearchParams(window.location.search);
    const parsedNext = safeNext(sp.get("next"));
    const parsedCallbackError = sp.get("callback_error") === "1";
    const parsedReturning =
      sp.get("logged_out") === "1" || sp.get("returning") === "1";

    const deviceIsIOS = isIOS();
    const appIsStandalone = isStandalone();

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
    (target?: string) => {
      window.location.assign(safeNext(target ?? next));
    },
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
    setMessage(
      "Sign-in did not complete in this browser context. On iPhone, Safari and the Home Screen app may not share login. Use code sign-in below in the same place you are using Quiet Mirror."
    );
  }, [callbackError]);

  useEffect(() => {
    const STORAGE_KEY = "havenly:auth_complete";

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        goNext(JSON.parse(e.newValue)?.next);
      } catch {
        goNext();
      }
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
      try {
        bc?.close();
      } catch {}
    };
  }, [goNext]);

  useEffect(() => {
    if (!paramsReady) return;
    try {
      window.localStorage.setItem("havenly:auth_next", next);
    } catch {
      // ignore storage errors
    }
  }, [next, paramsReady]);

  async function onSendEmail() {
    setStatus("loading");
    setMessage(null);

    try {
      window.localStorage.setItem("havenly:auth_next", next);
    } catch {
      // ignore
    }

    const fd = new FormData();
    fd.set("email", email);

    const res = await sendMagicLink(fd);

    if (!res.success) {
      setStatus("error");
      setMessage(res.message || "Failed to send email.");
      return;
    }

    setStatus("success");
    setMessage(
      mode === "code"
        ? "Email sent. If your email includes a code, enter it below. If it shows a button or link instead, you can still open it to sign in."
        : "Email sent. Open the button or link in the same browser you started with. If you installed Quiet Mirror on iPhone, code sign-in is usually the safer option."
    );
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
      setMessage(res.message || "Invalid code.");
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
            <Image
              src="/pwa/icon-192.png"
              alt={CONFIG.appName}
              width={32}
              height={32}
              className="rounded-xl"
              priority
            />
            <span className="text-sm font-semibold text-qm-secondary">{CONFIG.appName}</span>
          </div>

          <h1 className="font-display max-w-sm text-4xl font-semibold leading-[1.1] tracking-tight text-qm-primary">
            {isReturning ? (
              <>
                Welcome back.
                <br />
                <span className="text-qm-faint">Your journal is waiting.</span>
              </>
            ) : (
              <>
                Your private space
                <br />
                <span className="text-qm-faint">to think out loud.</span>
              </>
            )}
          </h1>

          <div className="mt-8 max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-5">
            <p className="text-base italic leading-relaxed text-qm-secondary">
              &ldquo;{sideQuote.text}&rdquo;
            </p>
          </div>

          {!isReturning && (
            <ul className="mt-7 max-w-xs space-y-3">
              {[
                "Write privately — your entries are never shared or sold",
                "AI reflects back what it notices in your own words",
                "See patterns across entries over time with Premium",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-qm-muted">
                  <span className="mt-0.5 shrink-0 text-qm-positive">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-8 max-w-xs text-xs leading-relaxed text-qm-faint">
            Your entries are private, never shared, and never used to train AI models.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-qm-faint transition-colors hover:text-qm-muted"
          >
            ← Back to home
          </Link>
        </div>

        {/* ── Right column — form ── */}
        <div className="w-full">
          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-qm-elevated p-6 shadow-qm-card backdrop-blur sm:p-7">
            {/* Mobile header */}
            <div className="mb-5 lg:hidden">
              <div className="mb-4 flex items-center gap-2">
                <Image
                  src="/pwa/icon-192.png"
                  alt={CONFIG.appName}
                  width={28}
                  height={28}
                  className="rounded-lg"
                />
                <span className="text-sm font-semibold text-qm-secondary">{CONFIG.appName}</span>
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-qm-primary">
                {isReturning ? "Welcome back." : "Your private journal."}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-qm-muted">
                {isReturning
                  ? "Your journal is waiting."
                  : "Write honestly. Quiet Mirror reflects back what it notices — gently, and only when you ask."}
              </p>
            </div>

            {/* Desktop card header */}
            <div className="mb-5 hidden lg:block">
              <h2 className="font-display text-2xl font-semibold text-qm-primary">
                {isReturning ? "Sign in to Quiet Mirror" : "Start your free journal"}
              </h2>
              <p className="mt-1 text-sm text-qm-faint">
                {ios
                  ? "Use the code option — it works best on iPhone."
                  : isReturning
                  ? "Choose the method that fits this device."
                  : "No password. No card required. One email to begin."}
              </p>
            </div>

            {standalone && (
              <div className="mb-5 rounded-2xl border border-qm-positive-border bg-qm-positive-strong/[0.06] p-4 text-sm leading-relaxed text-qm-positive">
                You&apos;re using the Home Screen app.{" "}
                <span className="font-semibold">Code sign-in</span> is usually the most reliable
                choice here.
              </div>
            )}

            {message && (
              <div
                className={`mb-5 rounded-2xl border p-4 text-sm leading-relaxed ${
                  status === "success"
                    ? "border-qm-positive-border bg-qm-positive-strong/[0.06] text-qm-positive"
                    : status === "error"
                    ? "border-qm-danger-border bg-qm-danger-strong/[0.06] text-qm-danger"
                    : "border-white/10 bg-white/[0.03] text-qm-primary"
                }`}
              >
                {message}
              </div>
            )}

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-qm-border-card bg-qm-card p-1.5">
              {(["code", "link"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                    mode === m
                      ? "bg-white/10 text-qm-primary shadow-sm"
                      : "text-qm-muted hover:text-qm-primary"
                  }`}
                >
                  {m === "code" ? "Code" : "Magic link"}
                  <span className="mt-0.5 block text-[11px] font-normal text-qm-faint">
                    {m === "code" ? "Best on iPhone" : "Best on desktop"}
                  </span>
                </button>
              ))}
            </div>

            {/* Email input */}
            <div className="mt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-faint">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email && mode === "link") onSendEmail();
                }}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-qm-border-card bg-qm-elevated px-4 py-3 text-sm text-qm-primary outline-none transition placeholder:text-qm-muted focus:border-[color:var(--qm-accent)]"
              />
            </div>

            {mode === "link" ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Sending…" : "Send magic link"}
                </button>
                <p className="mt-3 text-center text-xs leading-relaxed text-qm-faint">
                  Open the email link in the same browser you started with.
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-qm-accent px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-qm-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Sending…" : "Send sign-in email"}
                </button>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-qm-faint">
                    Code from email
                  </label>
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && tokenOk) onVerifyCode();
                    }}
                    inputMode="numeric"
                    placeholder="Enter 6–8 digit code"
                    className="w-full rounded-2xl border border-qm-border-card bg-qm-elevated px-4 py-3 text-sm text-qm-primary outline-none transition placeholder:text-qm-muted focus:border-[color:var(--qm-accent)]"
                  />
                  <button
                    type="button"
                    onClick={onVerifyCode}
                    disabled={status === "loading" || !email || !tokenOk}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-qm-primary transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading" ? "Verifying…" : "Verify and sign in"}
                  </button>
                  <p className="mt-3 text-xs leading-relaxed text-qm-faint">
                    Tip: if the email shows spaces between numbers, just paste it. Quiet Mirror removes
                    spaces automatically.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-2 text-center lg:hidden">
              <Link
                href="/"
                className="text-sm font-medium text-qm-positive transition-colors hover:text-qm-positive-hover"
              >
                ← Back to Home
              </Link>
              <p className="text-xs text-qm-faint">
                Desktop → magic link · iPhone Home Screen → code
              </p>
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
