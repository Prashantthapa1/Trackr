/**
 * middleware.ts
 *
 * Lightweight Next.js edge middleware that protects authenticated routes.
 * Instead of importing the full auth config (which includes Prisma and bcryptjs),
 * we simply check for the Auth.js session cookie. This keeps the Edge bundle
 * under 1MB for Vercel deployment.
 */
import { NextResponse, type NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/reports",
  "/team",
  "/teams",
  "/upgrade",
  "/admin",
  "/budgets",
  "/settings",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the path is protected
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Auth.js session cookie (production or development)
  const sessionToken = req.cookies.get("authjs.session-token") ||
                       req.cookies.get("__Secure-authjs.session-token");

  if (!sessionToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (static assets)
     * - favicon.ico
     * - api/webhooks (Paddle needs unauthenticated access)
     * - api/auth (Auth.js routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/auth).*)",
  ],
};
