import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/offline",
  "/manifest.json",
  "/sw.js",
  "/api/auth",
  "/api/health",
  "/api/sync",
];

// Static file extensions to skip
const STATIC_EXTENSIONS = [".svg", ".png", ".jpg", ".ico", ".css", ".js", ".woff", ".woff2"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
    return NextResponse.next();
  }

  // Skip public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Skip traceability public pages (consumer-facing QR pages)
  if (pathname.startsWith("/traceability/")) {
    return NextResponse.next();
  }

  // Check for auth token in cookies or authorization header
  const accessToken = request.cookies.get("access_token")?.value;
  const authHeader = request.headers.get("Authorization");

  if (!accessToken && !authHeader) {
    // API routes return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Autenticazione richiesta.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    // Dashboard routes redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Add tenant context headers for downstream handlers
  const response = NextResponse.next();

  // Extract cooperative context from the JWT payload (decoded in auth-service)
  // The actual tenant filtering happens at the data layer
  if (accessToken) {
    response.headers.set("x-has-auth", "true");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
