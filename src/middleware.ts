import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Edge Middleware for Route Protection
 * - Protected routes: /dashboard, /earn, /wallet, /activity, /menu, /settings, /business, /admin
 *   Redirects unauthenticated visitors to /auth/login?next=<encoded_path>
 * - Auth & Public landing routes: /, /auth/login, /auth/register
 *   Redirects authenticated visitors with earnora_session cookie to /dashboard
 * - Public routes: /, /terms, /privacy, static assets, API routes
 */

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/earn",
  "/wallet",
  "/activity",
  "/menu",
  "/settings",
  "/business",
  "/admin",
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get("earnora_session")?.value;
  const isAuthenticated = Boolean(sessionCookie && sessionCookie !== "0");

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  // If unauthenticated user tries to access protected page:
  if (isProtected && !isAuthenticated) {
    const fullTarget = `${pathname}${search}`;
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", fullTarget);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user visits auth login/register or landing page, redirect to dashboard:
  if (isAuthenticated) {
    if (pathname === "/" || pathname === "/auth/login" || pathname === "/auth/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public assets)
     * - favicon.ico, manifest.json, sw.js (browser meta files)
     */
    "/((?!api|_next/static|_next/image|assets|favicon.ico|manifest.json|sw.js).*)",
  ],
};
