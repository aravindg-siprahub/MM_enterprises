import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    // If visiting login page, always clear the session cookie and show login form
    if (pathname === '/admin/login') {
      const response = NextResponse.next();
      // Clear any existing token so credentials are always required
      response.cookies.set('admin_token', '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
      });
      return response;
    }

    // For all other admin routes, check for auth cookie
    const token = request.cookies.get('admin_token');
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match /admin and all sub-paths like /admin/products, /admin/login, etc.
  matcher: ['/admin', '/admin/:path*'],
};
