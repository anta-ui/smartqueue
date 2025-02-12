import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/reset-password",
  "/verify-email",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.includes(pathname);

  // Récupérer le token depuis les cookies
  const token = request.cookies.get('access_token')?.value;

  // Vérifier si un token est présent
  const hasToken = !!token;

  console.log("Middleware executed", { pathname, hasToken });

  // Si c'est une ressource statique (images, fichiers, etc.), ne pas intercepter
  if (
    pathname.startsWith("/images/") ||
    pathname.startsWith("/_next/") || // Pour les fichiers Next.js générés (JS, CSS, etc.)
    pathname.startsWith("/fonts/") || // Si vous avez des polices
    pathname.startsWith("/icons/") || // Si vous avez des icônes
    pathname.match(/\.[a-zA-Z0-9]{1,5}$/) // Si c'est un fichier avec une extension (ex: .jpg, .png, .css)
  ) {
    return NextResponse.next(); // Laisse passer la requête sans intercepter
  }

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une route protégée
  if (!hasToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si l'utilisateur est authentifié et essaie d'accéder à une route publique (sauf la page d'accueil)
  if (hasToken && isPublicRoute && pathname !== "/" && pathname !== "/login" && pathname !== "/register" && pathname !== "/reset-password" && pathname !== "/verify-email") {
    return NextResponse.redirect(new URL("/dashboard/home", request.url));
  }

  // Si le token est présent et valide, laisser passer la requête
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /fonts (inside /public)
     * 4. /icons (inside /public)
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|fonts|icons|images|[\\w-]+\\.\\w+).*)", // Exclut les chemins pour les images et autres fichiers statiques
  ],
};
