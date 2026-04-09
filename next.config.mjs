/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    // ── Content Security Policy ──────────────────────────────────────────────
    //
    // Directives are scoped to exactly what the app uses:
    //
    //   script-src  — 'self' + Vercel Speed Insights CDN
    //                 'unsafe-inline' required for Next.js App Router hydration scripts
    //   style-src   — 'self' + 'unsafe-inline' for Tailwind inline style={{}} props
    //   img-src     — 'self' + data: (noise SVG in globals.css) + blob:
    //   font-src    — 'self' only (Google Fonts served locally via next/font)
    //   connect-src — self API routes + Supabase (REST + WebSocket) + PostHog + Vercel
    //   frame-src   — Paddle overlay iframe (*.paddle.com)
    //   object-src  — 'none' (no browser plugins)
    //   base-uri    — 'self' (prevents <base> tag injection attacks)
    //   form-action — 'self' (all form submissions go to own API routes)
    //
    // NOTE: 'unsafe-inline' for scripts weakens XSS protection but is required
    // by Next.js App Router. To harden further, migrate to nonce-based CSP via
    // middleware — see: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    const ContentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      [
        "connect-src 'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
        "https://*.posthog.com",
        "https://va.vercel-scripts.com",
        "https://*.paddle.com",
      ].join(" "),
      "frame-src https://*.paddle.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
