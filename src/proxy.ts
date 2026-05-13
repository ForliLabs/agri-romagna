import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/onboarding",
  "/offline",
  "/api/auth",
  "/api/health",
  "/api/sync",
  "/api/onboarding",
];

const STATIC_EXTENSIONS = [".svg", ".png", ".jpg", ".ico", ".css", ".js", ".woff", ".woff2"];

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
    pathname === "/sw.js" ||
    STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow traceability public pages (consumer-facing QR pages)
  if (pathname.startsWith("/traceability/") || pathname === "/traceability") {
    return NextResponse.next();
  }

  // Check for JWT in Authorization header or cookie
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader?.replace("Bearer ", "") ||
    request.cookies.get("access_token")?.value;

  if (!token) {
    // API routes return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Autenticazione richiesta.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // All other protected routes redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token exists — add auth header for downstream handlers
  const response = NextResponse.next();
  response.headers.set("x-has-auth", "true");
  return response;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
