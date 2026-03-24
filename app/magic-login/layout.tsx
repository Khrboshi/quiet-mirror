import { CONFIG } from "@/app/lib/config";

export const metadata = {
  title: `Sign in to ${CONFIG.appName}`,
  description: `Sign in to your private ${CONFIG.appName} journal with a magic link — no password needed.`,
};

export default function MagicLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
