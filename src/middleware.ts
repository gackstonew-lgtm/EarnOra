import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/earn",
  "/wallet",
  "/activity",
  "/menu",
  "/settings",
  "/business",
  "/advertiser",
  "/admin",
];

const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

  // Feature flag check for advertiser routes
  if (!adsEnabled && (pathname === "/advertiser" || pathname.startsWith("/advertiser/"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow public access to /advertiser/signup when ads are enabled
  if (pathname === "/advertiser/signup") {
    return NextResponse.next();
  }

  // Session verification: inspect earnora_session cookie and Supabase auth cookies
  const sessionCookie = request.cookies.get("earnora_session")?.value;
  const roleCookie = request.cookies.get("earnora_role")?.value || "user";
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

  const isAuthenticated = Boolean(
    (sessionCookie && sessionCookie !== "0") || hasSupabaseCookie
  );

  // 1. Root route "/" handling:
  // Logged-in -> /dashboard, Logged-out -> /auth/login
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // 2. Protected routes handling
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const fullTarget = `${pathname}${search}`;
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", fullTarget);
    return NextResponse.redirect(loginUrl);
  }

  // 2b. Role-based route protection for /advertiser/* and /admin/*
  if (isAuthenticated) {
    const isAdvertiserRoute =
      pathname === "/advertiser" || pathname.startsWith("/advertiser/");
    if (
      isAdvertiserRoute &&
      roleCookie !== "advertiser" &&
      roleCookie !== "business" &&
      roleCookie !== "admin"
    ) {
      const forbiddenUrl = new URL("/dashboard", request.url);
      forbiddenUrl.searchParams.set("error", "advertiser_access_required");
      return NextResponse.redirect(forbiddenUrl);
    }

    const isAdminRoute =
      pathname === "/admin" || pathname.startsWith("/admin/");
    if (isAdminRoute && roleCookie !== "admin") {
      const forbiddenUrl = new URL("/dashboard", request.url);
      forbiddenUrl.searchParams.set("error", "admin_access_required");
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // 3. Authenticated visitor on auth pages (/auth/login, /auth/register) -> redirect to destination or /dashboard
  if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
    const redirectParam = searchParams.get("redirectTo") || searchParams.get("next");
    const target =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
        : roleCookie === "advertiser"
        ? "/advertiser"
        : roleCookie === "admin"
        ? "/admin"
        : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|images|favicon.ico|manifest.json|sw.js).*)",
  ],
};
