import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Install the App | Quiet Mirror",
  description: "Add Quiet Mirror to your home screen for a faster, app-like journaling experience. No app store needed.",
};

export default function InstallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
