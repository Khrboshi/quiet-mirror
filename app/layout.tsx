// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Providers from "./providers";
import DeepLinkBootstrap from "./components/DeepLinkBootstrap";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InstallPrompt from "@/app/components/InstallPrompt";
import { CONFIG, BRAND } from "@/app/lib/config";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = CONFIG.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: BRAND.fullTitle,
    template: BRAND.titleTemplate,
  },
  description: CONFIG.description,
  // Add keywords for better SEO (optional but recommended)
  keywords: [
    "private journal",
    "AI journal",
    "journaling app",
    "emotional awareness",
    "pattern recognition",
    "mental wellness",
    "reflective writing",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa/icon-192.png" }],
  },
  appleWebApp: {
    capable: true,
    title: CONFIG.appName,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: CONFIG.appName,
    title: BRAND.fullTitle,
    description: CONFIG.ogDescription,
    url: SITE_URL,
    // Add OpenGraph image for better social sharing
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: BRAND.fullTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image", // Changed to summary_large_image for better visibility
    title: BRAND.fullTitle,
    description: CONFIG.ogDescription,
    images: ["/og-image.png"],
  },
  // Add robots meta for better SEO control
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Add verification tags if needed (optional)
  // verification: {
  //   google: "your-google-site-verification-code",
  // },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0d1a" }, // Updated to match your --qm-bg
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" }, // Updated to match your light mode --qm-bg
  ],
  // Add viewport settings for better mobile accessibility
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Mobile web app capabilities */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/pwa/icon-192.png" />
        
        {/* Improved meta description - ensures it's always present */}
        <meta name="description" content={CONFIG.description} />
        
        {/* Additional SEO meta tags */}
        <meta name="author" content="Quiet Mirror" />
        <meta name="copyright" content={`${new Date().getFullYear()} Quiet Mirror`} />
        
        {/* Accessibility: announce page language changes */}
        <meta httpEquiv="Content-Language" content="en" />
        
        {/* PWA status bar styling */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>

      <body
        className={`${fraunces.variable} ${dmSans.variable}`}
        suppressHydrationWarning
      >
        {/* Accessibility: skip link for keyboard and screen-reader users - improved styling */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-qm-accent focus:px-5 focus:py-3 focus:text-sm focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-qm-accent focus:ring-offset-2 focus:ring-offset-qm-bg"
          style={{ zIndex: 9999 }}
        >
          Skip to main content
        </a>

        <DeepLinkBootstrap />

        <Providers>
          <Navbar />
          <InstallPrompt />

          {/* Content anchor for skip link - added role and aria-label for accessibility */}
          <main id="content" role="main" tabIndex={-1} aria-label="Main content">
            {children}
          </main>

          <Footer />
        </Providers>

        <SpeedInsights />
      </body>
    </html>
  );
}
