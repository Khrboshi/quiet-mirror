// app/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { CONFIG } from "@/app/lib/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/[0.08]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label={`${CONFIG.appName} home`}
            >
              <Image
                src="/pwa/icon-192.png"
                alt={CONFIG.appName}
                width={22}
                height={22}
                className="rounded-md"
                unoptimized
              />
              <span className="text-sm font-semibold text-white">{CONFIG.appName}</span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500">
              A private space to write, reflect, and notice what keeps happening
              in your life.
            </p>

            <p className="text-[11px] leading-relaxed text-slate-600">
              Entries are private and never used to train AI models.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 text-xs text-slate-500">
            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Product
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="transition-colors hover:text-slate-300">
                  About
                </Link>
                <Link href="/upgrade" className="transition-colors hover:text-slate-300">
                  Pricing
                </Link>
                <Link href="/blog" className="transition-colors hover:text-slate-300">
                  Blog
                </Link>
                <Link href="/install" className="transition-colors hover:text-slate-300">
                  Install app
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Account
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/magic-login" className="transition-colors hover:text-slate-300">
                  Sign in
                </Link>
                <Link href="/dashboard" className="transition-colors hover:text-slate-300">
                  Dashboard
                </Link>
                <Link href="/tools" className="transition-colors hover:text-slate-300">
                  Tools
                </Link>
                <Link href="/settings" className="transition-colors hover:text-slate-300">
                  Settings
                </Link>
                <Link
                  href="/settings/billing"
                  className="transition-colors hover:text-slate-300"
                >
                  Billing
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Legal
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/terms" className="transition-colors hover:text-slate-300">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-slate-300">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-white/[0.05] pt-6 text-xs text-slate-700 sm:flex-row sm:items-center">
          <p>© {year} {CONFIG.appName}. All rights reserved.</p>
          <p className="text-emerald-900/60">No ads · No data sales · 7-day free trial</p>
        </div>
      </div>
    </footer>
  );
}
