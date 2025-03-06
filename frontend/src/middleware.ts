// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  
  // Déterminer si c'est une route Super Admin
  const isSuperAdminRoute = request.nextUrl.pathname.startsWith('/super-admin');
  const isSuperAdminLogin = request.nextUrl.pathname === '/super-admin/login';
  
  // Routes Super Admin protégées (à l'exception de la page de login)
  const protectedSuperAdminRoutes = [
    '/super-admin/dashboard',
    '/super-admin/organizations',
    '/super-admin/settings',
    '/super-admin/maintenance'
    // Ajoutez ici toutes les routes Super Admin qui nécessitent une authentification
  ];

  // Logique spécifique pour les routes Super Admin
  if (isSuperAdminRoute) {
    // Page de login : autoriser l'accès si non connecté
    if (isSuperAdminLogin) {
      if (token) {
        // Si déjà connecté, rediriger vers le dashboard
        //return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Routes Super Admin protégées
    if (protectedSuperAdminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!token) {
        // Rediriger vers la page de login Super Admin si pas de token
        return NextResponse.redirect(new URL('/super-admin/login', request.url));
      }
    }

    return NextResponse.next();
  }

  // Le reste de votre logique de middleware pour les routes normales
  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/(auth)') ||
    request.nextUrl.pathname === '/login';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  // Ne pas interférer avec les routes API
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Rediriger vers la page de login si non authentifié
  if (!token && isDashboardRoute) {
    const redirectUrl = new URL('/login', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si pas de token, rediriger vers la page de connexion
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};