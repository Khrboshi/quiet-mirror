import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Providers from "./providers";
import DeepLinkBootstrap from "./components/DeepLinkBootstrap";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InstallPrompt from "@/app/components/InstallPrompt";

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

const SITE_URL = "https://havenly-2-1.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Havenly — The Journal That Listens",
    template: "%s | Havenly",
  },
  description:
    "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning. Private AI journaling, free to start.",
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
    title: "Havenly",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Havenly",
    title: "Havenly — The Journal That Listens",
    description:
      "Write what's weighing on you. Get a gentle reflection back. Start seeing what keeps returning.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: "Havenly — The Journal That Listens",
    description: "Write what's weighing on you. Get a gentle reflection back.",
  },
};

export const viewport: Viewport = {
  themeColor: "#3ee7b0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/pwa/icon-192.png" />
      </head>

      <body
        className={`${fraunces.variable} ${dmSans.variable}`}
        suppressHydrationWarning
      >
        <DeepLinkBootstrap />
        <Providers>
          <Navbar />
          <InstallPrompt />
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
