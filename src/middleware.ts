import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/auth/login']; // paths that don't require authentication
const authPaths = ['/auth/login']; // authentication pages

export default function middleware(request: NextRequest) {
  const hasToken = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // If accessing root path
  if (pathname === '/') {
    // With token: redirect to dashboard
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Without token: redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If user has token and tries to access auth/login, redirect to dashboard
  if (hasToken && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user has no token and tries to access protected route, redirect to login
  if (!hasToken && !publicPaths.includes(pathname)) {
    let redirectUrl = `/auth/login`;
    if (request.nextUrl.searchParams.toString()) {
      redirectUrl += `?${request.nextUrl.searchParams}`;
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/auth/login',
    '/',
    '/dashboard',
    '/declaration',
    '/admin/:path*',
  ],
};
