import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/forgot-password"];
const adminRoutes = ["/admin"];
const apiAdminRoutes = ["/api/users", "/api/audit", "/api/email"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Allow auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public routes — redirect to dashboard if authenticated
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes — redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes — check role
  if (adminRoutes.some((r) => pathname.startsWith(r))) {
    const adminRoles = ["SUPER_SUPER_ADMIN", "SUPER_ADMIN", "ADMIN"];
    if (!adminRoles.includes(user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Admin API routes — check role
  if (apiAdminRoutes.some((r) => pathname.startsWith(r))) {
    const adminRoles = ["SUPER_SUPER_ADMIN", "SUPER_ADMIN", "ADMIN"];
    if (!adminRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|public).*)",
  ],
};
