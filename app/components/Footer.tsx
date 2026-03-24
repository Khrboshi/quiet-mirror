// app/components/Footer.tsx
//
// "use client" is required here because FooterLinks reads live session state
// via useSupabase(). If you later want to move session-reading to a server
// component, pass `isSignedIn` as a prop and remove this directive.
"use client";

import Link from "next/link";
import Image from "next/image";
import { CONFIG } from "@/app/lib/config";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";

// ─── Sub-component ────────────────────────────────────────────────────────────

function FooterLinks({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <nav aria-label="Footer navigation">
      <div className="flex flex-wrap gap-x-10 gap-y-6 text-xs text-slate-500">
        {/* Product */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Product
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/about"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              About
            </Link>
            <Link
              href="/upgrade"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Blog
            </Link>
            <Link
              href="/install"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Install app
            </Link>
          </div>
        </div>

        {/* Account — context-aware */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>
          <div className="flex flex-col gap-2">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/tools"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Tools
                </Link>
                <Link
                  href="/settings"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Settings
                </Link>
                <Link
                  href="/settings/billing"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Billing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/magic-login"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Sign in
                </Link>
                {/* "Start free" goes to /upgrade so new visitors see pricing context */}
                <Link
                  href="/upgrade"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Start free
                </Link>
                <Link
                  href="/upgrade"
                  className="transition-colors duration-150 hover:text-slate-300"
                >
                  Go Premium
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Legal */}
        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Legal
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/terms"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Privacy Policy
            </Link>
            <a
              href={`mailto:${CONFIG.supportEmail}`}
              className="transition-colors duration-150 hover:text-slate-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();
  const { session } = useSupabase();
  const isSignedIn = !!session;

  return (
    <footer className="mt-16 border-t border-white/[0.08]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="max-w-xs space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity duration-150 hover:opacity-80"
              aria-label={`${CONFIG.appName} home`}
            >
              <Image
                src="/pwa/icon-192.png"
                alt={CONFIG.appName}
                width={22}
                height={22}
                className="rounded-md"
                // No `unoptimized` — Next.js handles local /public/ images natively
              />
              <span className="text-sm font-semibold text-white">
                {CONFIG.appName}
              </span>
            </Link>

            {/* Pull tagline from CONFIG so rebranding this file is automatic */}
            <p className="text-xs leading-relaxed text-slate-500">
              {CONFIG.tagline}
            </p>

            <p className="text-[11px] leading-relaxed text-slate-600">
              Your entries stay private and are never used to train AI models.
            </p>
          </div>

          <FooterLinks isSignedIn={isSignedIn} />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/[0.05] pt-6 text-xs text-slate-600 sm:flex-row sm:items-center">
          <p>
            © {year} {CONFIG.appName}. All rights reserved.
          </p>
          {/* Trust signals: ensure sufficient contrast on dark backgrounds */}
          <p className="text-emerald-700">
            No ads · No data sales · 7-day free trial
          </p>
        </div>
      </div>
    </footer>
  );
}
