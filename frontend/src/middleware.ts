import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side route protection.
 * Runs BEFORE React renders — prevents even a flash of protected content.
 *
 * Rules:
 *  - /admin/*  → must have a valid token + role ADMIN
 *  - /dashboard/* → must have a valid token + role PARENT
 *  - /select-plan → must be authenticated (any role)
 *  - All other routes → pass through
 *
 * NOTE: We only check token presence & role here (no signature verify —
 *       the backend JWT guard is the real authority).
 *       This middleware is a UX guard, not a security perimeter.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth cookie (set at login via localStorage — we sync it as a cookie)
  const token = request.cookies.get('mn_token')?.value;
  const userRaw = request.cookies.get('mn_user')?.value;

  let role: string | null = null;
  if (userRaw) {
    try { role = JSON.parse(decodeURIComponent(userRaw))?.role ?? null; }
    catch { role = null; }
  }

  const isAuthenticated = !!token;

  // ── /admin/* ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role !== 'ADMIN') {
      // PARENT trying to access admin → send to their dashboard
      return NextResponse.redirect(new URL('/dashboard/parent', request.url));
    }
  }

  // ── /dashboard/* ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (role === 'ADMIN') {
      // Admin trying to access customer dashboard → send to admin panel
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // ── /select-plan ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/select-plan')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/select-plan/:path*'],
};
