import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLE_PERMISSIONS, Permission } from "@/lib/permissions";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Additional route-level permission checks
    if (pathname.startsWith("/admin")) {
      const userPermissions = (token?.role ? ROLE_PERMISSIONS[token.role as keyof typeof ROLE_PERMISSIONS] : []) as Permission[];
      if (!userPermissions.includes("MANAGE_USERS")) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all protected routes except static assets, login, unauthorized, and nextauth api routes.
     */
    "/((?!login|unauthorized|_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
