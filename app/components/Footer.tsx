// app/components/Footer.tsx
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand — proper logo + wordmark, no sparkle emoji */}
          <div className="space-y-3 max-w-xs">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
              aria-label="Havenly home"
            >
              <Image
                src="/pwa/icon-192.png"
                alt="Havenly"
                width={22}
                height={22}
                className="rounded-md"
                unoptimized
              />
              <span className="text-sm font-semibold text-white">Havenly</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              A private space to write, reflect, and notice what keeps happening
              in your life.
            </p>
            {/* Privacy promise — promoted from invisible copyright bar */}
            <p className="text-[11px] leading-relaxed text-slate-600">
              Entries are private and never used to train AI models.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 text-xs text-slate-500">
            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">
                Product
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/about"
                  className="hover:text-slate-300 transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/upgrade"
                  className="hover:text-slate-300 transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="hover:text-slate-300 transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/install"
                  className="hover:text-slate-300 transition-colors"
                >
                  Install app
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">
                Account
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/magic-login"
                  className="hover:text-slate-300 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/dashboard"
                  className="hover:text-slate-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="hover:text-slate-300 transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/settings/billing"
                  className="hover:text-slate-300 transition-colors"
                >
                  Billing
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">
                Legal
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/privacy"
                  className="hover:text-slate-300 transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-700">
          <p>© {year} Havenly. All rights reserved.</p>
          <p className="text-emerald-900/60">
            No ads · No data sales · 7-day refund guarantee
          </p>
        </div>
      </div>
    </footer>
  );
}
