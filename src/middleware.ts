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
  "/admin",
];

const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  // Session verification: inspect earnora_session cookie and Supabase auth cookies
  const sessionCookie = request.cookies.get("earnora_session")?.value;
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

  // 3. Authenticated visitor on auth pages (/auth/login, /auth/register) -> redirect to destination or /dashboard
  if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
    const redirectParam = searchParams.get("redirectTo") || searchParams.get("next");
    const target =
      redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")
        ? redirectParam
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
