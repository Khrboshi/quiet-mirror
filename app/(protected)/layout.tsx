// app/(protected)/layout.tsx
import type { ReactNode } from "react";

/**
 * Protected layout (visual shell only)
 *
 * - NO server-side auth check here.
 * - NO extra Supabase provider (root layout already wraps the app).
 * - This prevents accidental logouts on hard refresh (CTRL+F5),
 *   because the server no longer redirects before the client
 *   has a chance to recover the Supabase session.
 */
export const dynamic = "force-dynamic";

// Add metadata for protected routes
export const metadata = {
  robots: {
    index: false, // Prevent search engines from indexing protected pages
    follow: false,
  },
};

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-qm-bg text-qm-primary">
      {/* 
        Accessibility: Announce that this is a protected area 
        This is a visual-only indicator for screen readers
      */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Protected area: Your journal content is private
      </div>
      
      {children}
    </div>
  );
}
