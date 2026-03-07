// app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div className="space-y-2 max-w-xs">
            <p className="text-sm font-semibold text-white">✦ Havenly</p>
            <p className="text-xs leading-relaxed text-slate-500">
              A private space to write, reflect, and notice what keeps happening in your life.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 text-xs text-slate-500">
            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">Product</p>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
                <Link href="/upgrade" className="hover:text-slate-300 transition-colors">Premium</Link>
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <Link href="/install" className="hover:text-slate-300 transition-colors">Install app</Link>
              </div>
            </div>
            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">Account</p>
              <div className="flex flex-col gap-2">
                <Link href="/magic-login" className="hover:text-slate-300 transition-colors">Sign in</Link>
                <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
                <Link href="/settings" className="hover:text-slate-300 transition-colors">Settings</Link>
              </div>
            </div>
            <div className="space-y-2.5">
              <p className="font-semibold uppercase tracking-wider text-slate-600 text-[10px]">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-700">
          <p>© {year} Havenly. All rights reserved.</p>
          <p>Your entries are private and never used to train AI models.</p>
        </div>
      </div>
    </footer>
  );
}
