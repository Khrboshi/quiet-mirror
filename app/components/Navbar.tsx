"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";
import { CONFIG } from "@/app/lib/config";

type NavLink = { href: string; label: string };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();
  const { isStandalone } = useInstallAvailability();

  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!session;

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileOpen]);

  // Escape key closes menu
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Prefetch authenticated routes
  useEffect(() => {
    if (!isLoggedIn) return;
    ["/dashboard", "/journal", "/insights", "/tools", "/settings"].forEach((route) => {
      router.prefetch(route);
    });
  }, [isLoggedIn, router]);

  // ─── Nav link definitions ─────────────────────────────────────────────────
  // "Premium" renamed to "Pricing" — clearer for cold visitors
  const publicLinks: NavLink[] = [
    { href: "/about",   label: "About"   },
    { href: "/blog",    label: "Blog"    },
    { href: "/upgrade", label: "Pricing" },
  ];

  const authLinks: NavLink[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/journal",   label: "Journal"   },
    { href: "/insights",  label: "Insights"  },
    { href: "/tools",     label: "Tools"     },
    { href: "/settings",  label: "Settings"  },
    { href: "/install",   label: "Install"   },
  ];

  const shouldShowInstall = useMemo(() => !isStandalone, [isStandalone]);

  const links = useMemo(() => {
    const base = isLoggedIn ? authLinks : publicLinks;
    return shouldShowInstall
      ? base
      : base.filter((link) => link.href !== "/install");
  }, [isLoggedIn, shouldShowInstall]);

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      await fetch("/logout", { method: "GET" });
      window.location.href = "/magic-login?logged_out=1";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/magic-login";
    }
  }

  return (
    <>
      {/* ── Desktop / shared header ─────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4">

          {/* Logo */}
          <Link
            href="/"
            prefetch
            className="flex items-center gap-2 text-lg font-semibold text-white transition-opacity hover:opacity-90"
            aria-label={`${CONFIG.appName} home`}
          >
            <Image
              src="/pwa/icon-192.png"
              alt={CONFIG.appName}
              width={24}
              height={24}
              className="rounded-md"
              priority
              unoptimized
            />
            <span>{CONFIG.appName}</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const active = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch
                  className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "text-slate-300 hover:bg-white/[0.04] hover:text-emerald-300"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {!isLoggedIn ? (
              pathname !== "/magic-login" && (
              <Link
                href="/magic-login"
                prefetch
                className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:-translate-y-px"
              >
                Start free
              </Link>
              )
            ) : (
              <button
                onClick={handleLogout}
                className="ml-2 inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 transition-colors hover:bg-white/5 md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Spacer so content isn't hidden under fixed header */}
      <div className="h-[72px]" />

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu backdrop"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Slide-down panel */}
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-[72px] bottom-0 z-50 flex flex-col bg-[#020617]/95"
          >
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
              <div className="mx-auto flex max-w-xl flex-col">
                <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-emerald-500/70">
                  {isLoggedIn
                    ? "Your space"
                    : "Private journaling that reflects back"}
                </p>

                <nav className="flex flex-col gap-2">
                  {links.map((link) => {
                    const active = isActiveLink(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch
                        onClick={() => setMobileOpen(false)}
                        className={`rounded-2xl border px-4 py-4 text-base font-medium transition-colors ${
                          active
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : "border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                {!isLoggedIn ? (
                  pathname !== "/magic-login" ? (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-medium text-white">
                      Start with a private journal entry.
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      No feed, no pressure, no card required. Just a calmer
                      place to put what is on your mind.
                    </p>

                    <Link
                      href="/magic-login"
                      prefetch
                      onClick={() => setMobileOpen(false)}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
                    >
                      Write your first entry free →
                    </Link>
                  </div>
                  ) : null
                ) : (
                  <button
                    onClick={handleLogout}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15"
                  >
                    Logout
                  </button>
                )}

                <p className="mt-5 text-center text-xs leading-relaxed text-slate-600">
                  Havenly is built for quiet, private reflection — not
                  performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
