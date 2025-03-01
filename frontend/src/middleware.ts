// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  // Définir les chemins protégés et publics
  const isPublicRoute = request.nextUrl.pathname.startsWith('/(auth)') || 
                       request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // Ne pas interférer avec les routes API
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Rediriger vers la page de login si non authentifié
  if (!token && isDashboardRoute) {
    const redirectUrl = new URL('/(auth)/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Rediriger vers le dashboard si déjà authentifié
  if (token && isPublicRoute) {
    const redirectUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};