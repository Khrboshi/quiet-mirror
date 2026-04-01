"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";
// --- CHANGE 1: Remove the old LanguageSwitcher import ---
// import LanguageSwitcher from "@/app/components/LanguageSwitcher"; 
import LanguageDropdown from "@/app/components/LanguageDropdown"; // Add this new import

type NavLink = { href: string; label: string };

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();
  const { isStandalone } = useInstallAvailability();

  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!session;

  // ... (all your existing useEffect hooks and functions remain unchanged) ...
  // ... (handleLogout, link definitions, etc.) ...
  
  const publicLinks: NavLink[] = [
    { href: "/about",   label: t.navbar.about   },
    { href: "/blog",    label: t.navbar.blog     },
    { href: "/upgrade", label: t.navbar.pricing  },
  ];

  const authLinks: NavLink[] = [
    { href: "/dashboard", label: t.navbar.dashboard },
    { href: "/journal",   label: t.navbar.journal   },
    { href: "/insights",  label: t.navbar.insights  },
    { href: "/tools",     label: t.navbar.tools     },
    { href: "/settings",  label: t.navbar.settings  },
    { href: "/install",   label: t.navbar.install   },
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
      <header className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: "var(--qm-border-card)", backgroundColor: "var(--qm-bg-glass-80)" }}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4">

          {/* Logo */}
          <Link
            href="/"
            prefetch
            className="flex items-center gap-2 text-lg font-semibold text-qm-primary transition-opacity hover:opacity-90"
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
                      ? "bg-qm-accent-soft text-qm-accent"
                      : "text-qm-secondary hover:bg-qm-accent-soft hover:text-qm-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* --- CHANGE 2: Replace LanguageSwitcher with LanguageDropdown --- */}
            <LanguageDropdown />

            {!isLoggedIn ? (
              pathname !== "/magic-login" && (
              <Link
                href="/magic-login"
                prefetch
                className="qm-btn-primary ms-2 inline-flex items-center justify-center px-4 py-2 text-sm"
              >
                {t.navbar.startFree}
              </Link>
              )
            ) : (
              <button
                onClick={handleLogout}
                className="ms-2 inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium text-qm-danger transition-colors hover:bg-qm-danger-soft hover:text-qm-danger-hover"
              >
                {t.navbar.logout}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-qm-secondary transition-colors hover:bg-qm-accent-soft md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.navbar.closeMenu : t.navbar.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ... (Rest of your component remains exactly the same) ... */}
      {/* ... (Spacer, mobile menu, etc.) ... */}
      <div className="h-[72px]" />

      {mobileOpen && (
        <div className="md:hidden">
          {/* ... mobile menu code ... */}
          {/* Note: I haven't changed the mobile language switcher. You can replace it there as well if desired. */}
        </div>
      )}
    </>
  );
}
