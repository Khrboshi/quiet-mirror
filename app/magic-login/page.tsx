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
    (window.navigator as any).standalone === true
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

  // Default: iOS => code, others => link
  const [mode, setMode] = useState<Mode>(() => (ios ? "code" : "link"));

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");

  const goNext = useCallback(
    (target?: string) => {
      const n = safeNext(target ?? next);
      // Hard navigation ensures cookies are applied consistently
      window.location.assign(n);
    },
    [next]
  );

  // If already logged in, go to next
  useEffect(() => {
    if (session?.user) {
      router.replace(next);
    }
  }, [session?.user, router, next]);

  // If callback exchange failed, guide to code
  useEffect(() => {
    if (!callbackError) return;
    setMode("code");
    setStatus("error");
    setMessage(
      "Sign-in didn’t complete in this browser context. On iPhone, Safari and the Home Screen app may not share login. Use the code method below to sign in inside the same place you’re using."
    );
  }, [callbackError]);

  // Step 3: listen for auth completion coming from the /auth/complete tab
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
      // BroadcastChannel not supported; storage fallback still works
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
        ? "Email sent. It may take a moment depending on your mail app. If your email includes a code, enter it below. Otherwise, open the button/link to sign in."
        : "Email sent. It may take a moment depending on your mail app. Open the button/link in the same browser you started with. If you installed Havenly on iPhone, you can use the code option instead."
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#0f172a] p-8 rounded-xl shadow-lg border border-white/10">
        <h1 className="text-2xl font-semibold text-center mb-2">Sign in to Havenly</h1>

        {standalone ? (
          <div className="mb-4 p-3 rounded bg-emerald-900/30 text-emerald-200 text-sm">
            You’re in the Home Screen app. On iPhone, the email link may open in Safari and won’t sign
            you into the Home Screen app. Use <span className="font-semibold">code sign-in</span>.
          </div>
        ) : null}

        {message ? (
          <div
            className={`mb-4 p-3 rounded ${
              status === "success"
                ? "bg-emerald-900/40 text-emerald-300"
                : status === "error"
                ? "bg-red-900/40 text-red-300"
                : "bg-white/5 text-slate-200"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("code")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium border ${
              mode === "code"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/10 text-slate-300"
            }`}
          >
            Code (best on iPhone)
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium border ${
              mode === "link"
                ? "bg-white/10 border-white/20 text-white"
                : "bg-transparent border-white/10 text-slate-300"
            }`}
          >
            Magic link
          </button>
        </div>

        <label className="block text-sm mb-2">Email address</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md px-3 py-2 mb-4 bg-black/20 border border-white/20 text-white"
        />

        {mode === "link" ? (
          <button
            type="button"
            onClick={onSendEmail}
            disabled={status === "loading" || !email}
            className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-semibold py-2 rounded-md transition"
          >
            {status === "loading" ? "Sending..." : "Send Magic Link"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onSendEmail}
              disabled={status === "loading" || !email}
              className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-semibold py-2 rounded-md transition"
            >
              {status === "loading" ? "Sending..." : "Send Email (link + code if available)"}
            </button>

            <div className="mt-4">
              <label className="block text-sm mb-2">Code from email (6–8 digits)</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 8))}
                inputMode="numeric"
                placeholder="Enter code"
                className="w-full rounded-md px-3 py-2 mb-3 bg-black/20 border border-white/20 text-white"
              />
              <button
                type="button"
                onClick={onVerifyCode}
                disabled={status === "loading" || !email || !tokenOk}
                className="w-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold py-2 rounded-md transition"
              >
                {status === "loading" ? "Verifying..." : "Verify & Sign in"}
              </button>

              <p className="mt-2 text-xs text-slate-400">
                Tip: if the email shows spaces between numbers, just paste it — Havenly removes spaces automatically.
              </p>
            </div>
          </>
        )}

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-blue-300 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          Desktop: magic link works. iPhone Home Screen app: use code.
        </p>
      </div>
    </div>
  );
}

export default function MagicLoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Loading…</div>}>
      <MagicLoginInner />
    </Suspense>
  );
}
