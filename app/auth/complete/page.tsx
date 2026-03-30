// app/auth/complete/page.tsx
import type { Metadata } from "next";
import { CONFIG } from "@/app/lib/config";
import CompleteClient from "./CompleteClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Signing you in | ${CONFIG.appName}`,
  description: `Completing sign-in to ${CONFIG.appName}.`,
  robots: { index: false, follow: false },
};

export default function AuthCompletePage() {
  return <CompleteClient />;
}
