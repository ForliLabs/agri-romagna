import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/offline",
  "/api/auth",
  "/api/health",
  "/traceability",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public paths
  if (isStaticAsset(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for JWT in Authorization header or cookie
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader?.replace("Bearer ", "") ||
    request.cookies.get("access_token")?.value;

  // For API routes, return 401 JSON if no token
  if (pathname.startsWith("/api/") && !token) {
    return NextResponse.json(
      { error: "Autenticazione richiesta.", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  // For dashboard pages, redirect to login if no token
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists - allow request (JWT validation happens in route handlers)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
