// app/components/Footer.tsx
//
// "use client" is required here because FooterLinks reads live session state
// via useSupabase(). If you later want to move session-reading to a server
// component, pass `isSignedIn` as a prop and remove this directive.
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";

// ─── Helper component for footer links with accessibility ───────────────────

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}

function FooterLink({ href, children, isExternal = false }: FooterLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const baseClasses = `
    transition-colors duration-150 
    text-qm-secondary hover:text-qm-accent
    focus:outline-none focus:ring-2 focus:ring-qm-accent focus:ring-offset-2 focus:ring-offset-qm-bg rounded-md
    ${isActive ? "text-qm-accent" : ""}
  `.trim();

  if (isExternal) {
    return (
      <a
        href={href}
        className={baseClasses}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${children} (opens in new tab)`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses} aria-current={isActive ? "page" : undefined}>
      {children}
    </Link>
  );
}

// ─── Section Header Component for consistency ────────────────────────────────

function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-qm-muted">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

// ─── Footer Links Grid ───────────────────────────────────────────────────────

function FooterLinks({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <nav aria-label="Footer navigation" className="w-full sm:w-auto">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-12">
        
        {/* Product Section */}
        <FooterSection title="Product">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/upgrade">Pricing</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/install">Install app</FooterLink>
        </FooterSection>

        {/* Account Section — context-aware */}
        <FooterSection title="Account">
          {isSignedIn ? (
            <>
              <FooterLink href="/dashboard">Dashboard</FooterLink>
              <FooterLink href="/tools">Tools</FooterLink>
              <FooterLink href="/settings">Settings</FooterLink>
              <FooterLink href="/settings/billing">Billing</FooterLink>
            </>
          ) : (
            <>
              <FooterLink href="/magic-login">Sign in</FooterLink>
              <FooterLink href="/upgrade">Start free</FooterLink>
              <FooterLink href="/upgrade">Go Premium</FooterLink>
            </>
          )}
        </FooterSection>

        {/* Legal Section */}
        <FooterSection title="Legal">
          <FooterLink href="/terms">Terms of Service</FooterLink>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
          <FooterLink href={`mailto:${CONFIG.supportEmail}`} isExternal>
            Contact
          </FooterLink>
        </FooterSection>
      </div>
    </nav>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();
  const { session } = useSupabase();
  const isSignedIn = !!session;

  return (
    <footer className="mt-16 border-t border-qm-border-subtle bg-qm-bg" role="contentinfo">
      <div className="mx-auto max-w-6xl px-6 py-10">
        
        {/* Top row: Brand + Links */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand Section */}
          <div className="max-w-xs space-y-3">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-md transition-opacity duration-150 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-qm-accent focus:ring-offset-2 focus:ring-offset-qm-bg"
              aria-label={`${CONFIG.appName} home`}
            >
              <Image
                src="/pwa/icon-192.png"
                alt={CONFIG.appName}
                width={22}
                height={22}
                className="rounded-md"
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-qm-primary">
                {CONFIG.appName}
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-qm-secondary">
              {CONFIG.tagline}
            </p>

            {/* Privacy reassurance — important for trust */}
            <p className="text-[11px] leading-relaxed text-qm-muted">
              Your entries stay private and are never used to train AI models.
            </p>
          </div>

          <FooterLinks isSignedIn={isSignedIn} />
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-qm-border-card pt-6 text-xs text-qm-muted sm:flex-row sm:items-center">
          <p>© {year} {CONFIG.appName}. All rights reserved.</p>
          
          {/* Trust badges with screen reader support */}
          <div className="flex flex-wrap gap-3" aria-label="Service guarantees">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span>
              <span>No ads</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span>
              <span>No data sales</span>
            </span>
            <span className="inline-flex items-center gap-1 text-qm-accent">
              <span aria-hidden="true">✨</span>
              <span>{PRICING.trialLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
