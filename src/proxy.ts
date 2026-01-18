import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";

/**
 * Proxy Next.js 16 - Remplace le middleware.ts
 * Gère l'authentification et les redirections globales
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques (pas besoin d'auth)
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/verify-2fa",
    "/landing",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-2fa",
    "/api/auth/refresh",
  ];

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Routes API - vérifier le token dans le header
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyAccessToken(token);

      if (!decoded || typeof decoded === "string") {
        return NextResponse.json(
          { error: "Token invalide" },
          { status: 401 }
        );
      }

      // Token valide, continuer
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }
  }

  // Routes UI protégées - vérifier le cookie ou localStorage
  // (Le client Zustand gère l'auth côté client)
  // Ici on peut juste rediriger vers login si pas de token

  const token = req.cookies.get("accessToken")?.value;

  if (!token) {
    // Rediriger vers la page de login
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded || typeof decoded === "string") {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Token valide, continuer
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Configuration des routes à matcher
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
