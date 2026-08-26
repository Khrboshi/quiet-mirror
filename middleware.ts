import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type SetAllCookies } from "@supabase/ssr";

const AUTH_PATHS = ["/magic-login", "/auth/callback", "/logout", "/install", "/insights/preview"];
const PROTECTED_PREFIXES = ["/dashboard", "/journal", "/tools", "/insights", "/settings"];

function isAuthPath(pathname: string) {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) return NextResponse.next();
  if (isAuthPath(pathname)) return NextResponse.next();
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const res = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookies => {
        cookies.forEach(({ name, value, options }) => {
          res.cookies.set({
            name,
            value,
            ...options,
            path: options?.path ?? "/",
            sameSite: (options?.sameSite as "lax" | "strict" | "none" | boolean | undefined) ?? "lax",
            secure: options?.secure ?? process.env.NODE_ENV === "production",
          });
        });
      }) satisfies SetAllCookies,
    },
  });

  // â Use getSession() in middleware â reads JWT from cookie locally,
  // no network call to Supabase Auth servers. Fast on every navigation.
  // Individual page routes still call getUser() for secure server actions.
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const to = req.nextUrl.clone();
    to.pathname = "/magic-login";
    to.searchParams.set("redirected", "1");
    to.searchParams.set("next", pathname);
    return NextResponse.redirect(to);
  }


  // Security headers — added by Auditor & Researcher
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://*.posthog.com https://fonts.googleapis.com https://vercel.live",
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://vercel.live",
    "frame-ancestors 'none'",
  ].join(';');
  res.headers.set('Content-Security-Policy', csp);
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/journal/:path*",
    "/tools/:path*",
    "/insights/:path*",
    "/settings/:path*",
    "/magic-login",
    "/auth/:path*",
    "/logout",
    "/install",
  ],
};
