import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Handle root path redirects
  if (pathname === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/projects', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect routes that require authentication
  if (
    pathname.startsWith('/projects') && 
    !token
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Prevent authenticated users from accessing login page
  if (
    pathname.startsWith('/login') && 
    token
  ) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/projects/:path*', '/login']
}; 