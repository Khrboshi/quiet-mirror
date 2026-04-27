// app/components/Footer.tsx
"use client";

/**
 * app/components/Footer.tsx
 *
 * Site-wide footer — links to legal pages, blog, and social.
 * Locale-aware via useTranslation(). Rendered on all public pages.
 */
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CONFIG } from "@/app/lib/config";
import { PRICING } from "@/app/lib/pricing";
import { useSupabase } from "@/app/components/SupabaseSessionProvider";
import { useTranslation } from "@/app/components/I18nProvider";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}

function FooterLink({ href, children, isExternal = false }: FooterLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { t } = useTranslation();

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
        aria-label={`${children} (${t.ui.opensInNewTab})`}
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

function FooterLinks({ isSignedIn }: { isSignedIn: boolean }) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t.footer.serviceGuarantees} className="w-full sm:w-auto">
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:flex sm:flex-wrap sm:gap-x-12">
        <FooterSection title={t.footer.product}>
          <FooterLink href="/about">{t.footer.about}</FooterLink>
          <FooterLink href="/upgrade">{t.footer.pricing}</FooterLink>
          <FooterLink href="/blog">{t.footer.blog}</FooterLink>
          <FooterLink href="/install">{t.footer.installApp}</FooterLink>
        </FooterSection>

        <FooterSection title={t.footer.account}>
          {isSignedIn ? (
            <>
              <FooterLink href="/dashboard">{t.footer.dashboard}</FooterLink>
              <FooterLink href="/tools">{t.footer.tools}</FooterLink>
              <FooterLink href="/settings">{t.footer.settings}</FooterLink>
              <FooterLink href="/settings/billing">{t.footer.billing}</FooterLink>
            </>
          ) : (
            <>
              <FooterLink href="/magic-login">{t.footer.signIn}</FooterLink>
              <FooterLink href="/upgrade">{t.footer.startFree}</FooterLink>
              <FooterLink href="/upgrade">{t.footer.goPremium}</FooterLink>
            </>
          )}
        </FooterSection>

        <FooterSection title={t.footer.legal}>
          <FooterLink href="/terms">{t.footer.termsOfService}</FooterLink>
          <FooterLink href="/privacy">{t.footer.privacyPolicy}</FooterLink>
          <FooterLink href={`mailto:${CONFIG.supportEmail}`} isExternal>
            {t.footer.contact}
          </FooterLink>
        </FooterSection>
      </div>
    </nav>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const { session } = useSupabase();
  const { t } = useTranslation();
  const ps = t.pricingStrings;
  const isSignedIn = !!session;

  return (
    <footer className="mt-16 border-t border-qm-border-subtle bg-qm-bg" role="contentinfo">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs space-y-3">
            <Link
              href="/"
              className="group flex items-center gap-2 rounded-md transition-opacity duration-150 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-qm-accent focus:ring-offset-2 focus:ring-offset-qm-bg"
              aria-label={t.ui.homeAriaLabel(CONFIG.appName)}
            >
              <Image
                src="/pwa/icon-192.png"
                alt={CONFIG.appName}
                width={22}
                height={22}
                className="rounded-md"
                aria-hidden="true"
              />
              <span className="font-brand-name text-sm font-semibold text-qm-primary">
                {CONFIG.appName}
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-qm-secondary">
              {t.footer.tagline}
            </p>

            <p className="text-[11px] leading-relaxed text-qm-muted">
              {t.footer.privacyAssurance}
            </p>
          </div>

          <FooterLinks isSignedIn={isSignedIn} />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-qm-border-card pt-6 text-xs text-qm-muted sm:flex-row sm:items-center">
          <p>{t.footer.allRightsReserved(CONFIG.appName, year)}</p>
          <div className="flex flex-wrap gap-3" aria-label={t.footer.serviceGuarantees}>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span>
              <span>{t.footer.noAds}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span>
              <span>{t.footer.noDataSales}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-qm-accent">
              <span aria-hidden="true">✨</span>
              <span>{ps.trialLabel(PRICING.trialDays)}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
