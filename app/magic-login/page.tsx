// app/magic-login/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/SupabaseSessionProvider";
import { sendMagicLink } from "./sendMagicLink";
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

function safeNext(raw: string | null): string {
  const v = (raw || "/dashboard").trim();
  if (!v.startsWith("/")) return "/dashboard";
  if (v.startsWith("//")) return "/dashboard";
  return v;
}

function MagicLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { session } = useSupabase();

  const next = useMemo(() => safeNext(sp.get("next")), [sp]);
  const callbackError = sp.get("callback_error") === "1";

  const ios = useMemo(() => isIOS(), []);
  const standalone = useMemo(() => isStandalone(), []);

  const [mode, setMode] = useState<Mode>(ios ? "code" : "link");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const goNext = useCallback(
    (target?: string) => {
      const n = safeNext(target ?? next);
      window.location.assign(n);
    },
    [next]
  );

  useEffect(() => {
    if (session?.user) {
      router.replace(next);
    }
  }, [session?.user, router, next]);

  useEffect(() => {
    if (!callbackError) return;
    setMode("code");
    setStatus("error");
    setMessage(
      "Sign-in did not complete in this browser context. On iPhone, Safari and the Home Screen app may not share login. Use code sign-in below in the same place you are using Havenly."
    );
  }, [callbackError]);

  useEffect(() => {
    const STORAGE_KEY = "havenly:auth_complete";

    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        goNext(data?.next);
      } catch {
        goNext();
      }
    };

    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("havenly_auth");
      bc.onmessage = (ev) => {
        if (ev?.data?.type === "AUTH_COMPLETE") {
          goNext(ev.data?.next);
        }
      };
    } catch {
      // storage fallback remains available
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      try {
        bc?.close();
      } catch {}
    };
  }, [goNext]);

  async function onSendEmail() {
    setStatus("loading");
    setMessage(null);

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
        : "Email sent. Open the button or link in the same browser you started with. If you installed Havenly on iPhone, code sign-in is usually the safer option."
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
  const tokenLen = digitsOnlyToken.length;
  const tokenOk = tokenLen >= 6 && tokenLen <= 8;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8">
        <div className="hidden lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
            Havenly sign in
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.05] tracking-tight text-white">
            Return to your private journal without friction.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
            Sign in with a magic link or a one-time code. Havenly is built to feel
            calm, private, and simple across desktop, mobile, and Home Screen use.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white">Magic link</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Best on desktop and in a normal mobile browser. Open the email link in
                the same place you started.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <p className="text-sm font-medium text-white">Code sign-in</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Best on iPhone Home Screen installations, where email links may open in
                Safari instead of the app.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-white">Privacy first</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Your email is used only for sign-in. Your journal stays private and is
                never used to train AI models.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-7">
            <div className="lg:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
                Havenly sign in
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Sign in to Havenly
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Your private space to write honestly, without the feed, noise, or pressure.
              </p>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-2xl font-semibold text-white">Sign in to Havenly</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Choose the method that fits this device best.
              </p>
            </div>

            {standalone ? (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-sm leading-relaxed text-emerald-200">
                You are using the Home Screen app. On iPhone, email links may open in
                Safari instead of the app, so <span className="font-semibold">code sign-in</span>{" "}
                is usually the most reliable choice here.
              </div>
            ) : null}

            {message ? (
              <div
                className={`mt-5 rounded-2xl border p-4 text-sm leading-relaxed ${
                  status === "success"
                    ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-200"
                    : status === "error"
                    ? "border-red-500/20 bg-red-500/[0.06] text-red-200"
                    : "border-white/10 bg-white/[0.03] text-slate-200"
                }`}
              >
                {message}
              </div>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-slate-950/60 p-1.5">
              <button
                type="button"
                onClick={() => setMode("code")}
                className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                  mode === "code"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Code
                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                  Best on iPhone
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode("link")}
                className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
                  mode === "link"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Magic link
                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                  Best on desktop
                </span>
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Email address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50"
              />
            </div>

            {mode === "link" ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Sending..." : "Send magic link"}
                </button>

                <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
                  Open the email link in the same browser you started with.
                </p>
              </div>
            ) : (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onSendEmail}
                  disabled={status === "loading" || !email}
                  className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading"
                    ? "Sending..."
                    : "Send email with sign-in link and code"}
                </button>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Code from email
                  </label>
                  <input
                    value={token}
                    onChange={(e) =>
                      setToken(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    inputMode="numeric"
                    placeholder="Enter 6–8 digit code"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/50"
                  />

                  <button
                    type="button"
                    onClick={onVerifyCode}
                    disabled={status === "loading" || !email || !tokenOk}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading" ? "Verifying..." : "Verify and sign in"}
                  </button>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Tip: if the email shows spaces between numbers, just paste it. Havenly
                    removes spaces automatically.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-3 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300"
              >
                ← Back to Home
              </Link>

              <p className="max-w-sm text-xs leading-relaxed text-slate-600">
                Desktop usually works best with magic link. iPhone Home Screen app usually
                works best with code sign-in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-sm text-slate-300">
          Loading…
        </div>
      }
    >
      <MagicLoginInner />
    </Suspense>
  );
}
