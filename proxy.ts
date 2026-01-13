// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isLoggedIn = !!token;
    const { pathname } = req.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = [
      "/auth/signin",
      "/auth/signout",
      "/auth/signup",
      "/auth/error",
      "/about",
    ];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthRoute = pathname.startsWith("/auth/");

    // Redirect authenticated users away from auth pages
    if (isLoggedIn && isAuthRoute && pathname !== "/auth/signout") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow public routes and API routes
    if (isPublicRoute || pathname.startsWith("/api/")) {
      return NextResponse.next();
    }

    // If user is not authenticated and trying to access protected route
    if (!isLoggedIn && !isPublicRoute) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // This is called for every route - we handle authorization in the function above
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
