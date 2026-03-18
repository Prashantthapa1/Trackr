/**
 * middleware.ts
 *
 * Next.js edge middleware that protects all authenticated routes. It runs
 * before any page renders, at the CDN edge — so unauthenticated users get
 * a fast redirect to /login without the server ever rendering the page.
 *
 * We use Auth.js's built-in `auth` export as middleware. The `authorized`
 * callback checks if the request path matches a protected pattern. If
 * there's no token and the route is protected, it redirects to /login.
 * Public routes (/, /login, /register, /api/webhooks) pass through.
 */
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/reports",
  "/team",
  "/upgrade",
  "/admin",
  "/budgets",
  "/settings",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

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
