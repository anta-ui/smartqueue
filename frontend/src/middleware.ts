import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get("access_token")?.value;
    const hasToken = Boolean(token);

    // Définition des routes protégées et publiques
    const dashboardRoutes = ["/dashboard", "/dashboard/settings", "/dashboard/profile"];
    const publicRoutes = ["/", "/login", "/register"];

    console.log(`Middleware - Path: ${pathname}, Token présent: ${hasToken}`);

    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une page du dashboard
    if (!hasToken && dashboardRoutes.some(route => pathname.startsWith(route))) {
        console.log("🚨 Redirection vers /login (Pas de token)");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Si l'utilisateur est déjà connecté et tente d'accéder à une page publique
    if (hasToken && publicRoutes.includes(pathname)) {
        console.log("✅ Redirection vers /dashboard (Déjà authentifié)");
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Si tout est OK, on laisse passer la requête
    console.log("✅ Accès autorisé à:", pathname);
    return NextResponse.next();
}

// Liste des chemins où le middleware doit s'appliquer
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register", "/"],
};
