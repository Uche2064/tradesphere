import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth";
import prisma from "../../../../../../lib/prisma";
import { verifyTOTP } from "@/lib/2fa";
import { TwoFactorType } from "../../../../../../generated/prisma/client";
import { verifyPassword } from "@/lib/security";

/**
 * POST /api/auth/2fa/disable
 * Désactive la 2FA après vérification
 */
export async function POST(req: NextRequest) {
  // Vérifier l'authentification
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const user = (req as any).user;

  try {
    const { code, password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Mot de passe requis" },
        { status: 400 }
      );
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true,
        isTwoFactor: true,
        twoFactorType: true,
        twoFactorSecret: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!userRecord.isTwoFactor) {
      return NextResponse.json(
        { error: "La 2FA n'est pas activée" },
        { status: 400 }
      );
    }

    // Vérifier le mot de passe
    const passwordValid = await verifyPassword(password, userRecord.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: "Mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Vérifier le code 2FA si fourni (recommandé mais pas obligatoire avec mot de passe)
    if (code) {
      let isValid = false;

      if (
        userRecord.twoFactorType === TwoFactorType.TOTP &&
        userRecord.twoFactorSecret
      ) {
        isValid = verifyTOTP(userRecord.twoFactorSecret, code);
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Code 2FA invalide" },
          { status: 400 }
        );
      }
    }

    // Désactiver la 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFactor: false,
        twoFactorSecret: null,
        twoFactorType: null,
      },
    });

    // Supprimer les OTP existants
    await prisma.otp.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json(
      { message: "2FA désactivée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la désactivation de la 2FA:", error);
    return NextResponse.json(
      { error: "Erreur lors de la désactivation de la 2FA" },
      { status: 500 }
    );
  }
}
