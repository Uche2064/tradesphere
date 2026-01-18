import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken } from "@/lib/jwt";
import prisma from "../../../../../lib/prisma";

/**
 * POST /api/auth/refresh
 * Rafraîchir le token d'accès avec le refresh token
 */
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token requis" },
        { status: 400 }
      );
    }

    // Vérifier le refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Refresh token invalide ou expiré" },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur existe et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        roleId: true,
        companyId: true,
        role: {
          select: {
            name: true,
            type: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou inactif" },
        { status: 401 }
      );
    }

    // Générer un nouveau token d'accès
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    return NextResponse.json(
      {
        success: true,
        accessToken: newAccessToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return NextResponse.json(
      { error: "Erreur lors du rafraîchissement du token" },
      { status: 500 }
    );
  }
}
