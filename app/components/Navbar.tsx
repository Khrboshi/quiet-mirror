"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { useInstallAvailability } from "@/app/hooks/useInstallAvailability";
import { CONFIG } from "@/app/lib/config";
import { useTranslation } from "@/app/components/I18nProvider";

type NavLink = { href: string; label: string };

// Available locales – adjust to match your i18n setup
const SUPPORTED_LOCALES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  // add others as needed
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, supabase } = useSupabase();
  const { isStandalone } = useInstallAvailability();

  const { t, locale, setLocale } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = !!session;

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setLangDropdownOpen(false);
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

  // Escape key closes menus
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setLangDropdownOpen(false);
      }
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
  const publicLinks: NavLink[] = [
    { href: "/about", label: t.navbar.about },
    { href: "/blog", label: t.navbar.blog },
    { href: "/upgrade", label: t.navbar.pricing },
  ];

  const authLinks: NavLink[] = [
    { href: "/dashboard", label: t.navbar.dashboard },
    { href: "/journal", label: t.navbar.journal },
    { href: "/insights", label: t.navbar.insights },
    { href: "/tools", label: t.navbar.tools },
    { href: "/settings", label: t.navbar.settings },
    { href: "/install", label: t.navbar.install },
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

  function handleLanguageChange(localeCode: string) {
    setLocale(localeCode);
    setLangDropdownOpen(false);
  }

  // Current language display name
  const currentLanguage =
    SUPPORTED_LOCALES.find((lang) => lang.code === locale)?.name || locale;

  return (
    <>
      {/* ── Desktop / shared header ─────────────────────────────────────── */}
      <header
        className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--qm-border-card)",
          backgroundColor: "var(--qm-bg-glass-80)",
        }}
      >
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

            {/* Languages dropdown (replaces separate switcher) */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  langDropdownOpen
                    ? "bg-qm-accent-soft text-qm-accent"
                    : "text-qm-secondary hover:bg-qm-accent-soft hover:text-qm-accent"
                }`}
                aria-expanded={langDropdownOpen}
                aria-haspopup="true"
              >
                {currentLanguage}
                <ChevronDown size={16} className="transition-transform duration-200" style={{ transform: langDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-qm-border-card bg-qm-bg-glass-95 py-2 shadow-lg backdrop-blur-md">
                  {SUPPORTED_LOCALES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-qm-accent-soft ${
                        locale === lang.code
                          ? "text-qm-accent font-medium"
                          : "text-qm-secondary"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ backgroundColor: "rgba(10, 13, 26, 0.75)" }}
          />

          {/* Slide-down panel */}
          <div
            id="mobile-menu"
            className="fixed inset-x-0 top-[72px] bottom-0 z-50 flex flex-col"
            style={{ backgroundColor: "var(--qm-bg-glass-95)" }}
          >
            <div className="flex-1 overflow-y-auto px-5 pb-8 pt-5">
              <div className="mx-auto flex max-w-xl flex-col">
                <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-qm-accent" style={{ opacity: 0.7 }}>
                  {isLoggedIn
                    ? t.navbar.yourSpace
                    : t.navbar.privateJournalingTagline}
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
                            ? "border-qm-accent bg-qm-accent-soft text-qm-accent"
                            : "border-qm-card bg-qm-card text-qm-primary hover:bg-qm-soft"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Languages dropdown for mobile (grouped under one tab) */}
                  <div className="relative w-full">
                    <button
                      type="button"
                      onClick={() => setLangDropdownOpen((prev) => !prev)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-base font-medium transition-colors ${
                        langDropdownOpen
                          ? "border-qm-accent bg-qm-accent-soft text-qm-accent"
                          : "border-qm-card bg-qm-card text-qm-primary hover:bg-qm-soft"
                      }`}
                    >
                      <span>{t.navbar.languages || "Languages"}</span>
                      <ChevronDown size={20} className="transition-transform duration-200" style={{ transform: langDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                    </button>

                    {langDropdownOpen && (
                      <div className="mt-2 rounded-2xl border border-qm-border-card bg-qm-bg-glass-95 p-2 backdrop-blur-md">
                        {SUPPORTED_LOCALES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLanguageChange(lang.code);
                              setMobileOpen(false); // optional: close menu after selection
                            }}
                            className={`block w-full rounded-xl px-4 py-3 text-left text-sm transition-colors hover:bg-qm-accent-soft ${
                              locale === lang.code
                                ? "text-qm-accent font-medium"
                                : "text-qm-secondary"
                            }`}
                          >
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>

                {!isLoggedIn ? (
                  pathname !== "/magic-login" ? (
                    <div className="mt-6 qm-panel rounded-3xl p-4">
                      <p className="text-sm font-medium text-qm-primary">
                        {t.navbar.privateTagline}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-qm-secondary">
                        {t.navbar.privateNoCred}
                      </p>
                      <Link
                        href="/magic-login"
                        prefetch
                        onClick={() => setMobileOpen(false)}
                        className="qm-btn-primary mt-4 inline-flex w-full items-center justify-center px-5 py-3.5 text-sm"
                      >
                        Write your first entry free →
                      </Link>
                    </div>
                  ) : null
                ) : (
                  <button
                    onClick={handleLogout}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-qm-danger-border bg-qm-danger-soft px-5 py-3.5 text-sm font-semibold text-qm-danger transition-colors hover:bg-qm-danger-soft hover:border-qm-danger"
                  >
                    {t.navbar.logout}
                  </button>
                )}

                <p className="mt-4 text-center text-xs leading-relaxed text-qm-faint">
                  Quiet Mirror is built for quiet, private reflection — not
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
