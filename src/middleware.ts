import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/forgot-password"];
const alwaysPublicRoutes = ["/demo", "/apply", "/api/apply"];
const adminRoutes = ["/admin"];
const uwRoutes = ["/uw"];
const apiUwRoutes = ["/api/uw"];
const apiAdminRoutes = ["/api/users", "/api/audit", "/api/email"];
const mfaExemptRoutes = ["/setup-mfa", "/mfa-verify", "/api/mfa/", "/api/auth/"];
const UW_ROLES = ["SUPER_SUPER_ADMIN", "SUPER_ADMIN", "ADMIN", "UNDERWRITER"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Always allow auth API
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Always-public routes (accessible whether logged in or not)
  if (alwaysPublicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // MFA-exempt routes — allow through but handle public route redirect
  if (mfaExemptRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Public routes — redirect to dashboard if authenticated + verified
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    if (user && user.mfaVerified !== false) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Not authenticated → login
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ===== MFA ENFORCEMENT =====
  if (user.mfaVerified === false) {
    if (user.mfaRequired && user.mfaEnabled) {
      // Has MFA set up but hasn't verified this session → verify page
      return pathname.startsWith("/api/")
        ? NextResponse.json({ error: "MFA verification required" }, { status: 403 })
        : NextResponse.redirect(new URL("/mfa-verify", req.url));
    }
    if (user.mfaRequired && !user.mfaEnabled) {
      // MFA required but not set up yet → setup page
      return pathname.startsWith("/api/")
        ? NextResponse.json({ error: "MFA setup required" }, { status: 403 })
        : NextResponse.redirect(new URL("/setup-mfa", req.url));
    }
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

  // Underwriting routes — admin or underwriter
  if (uwRoutes.some((r) => pathname.startsWith(r))) {
    if (!UW_ROLES.includes(user.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (apiUwRoutes.some((r) => pathname.startsWith(r))) {
    if (!UW_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|public).*)"],
};
