import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth";
import prisma from "../../../../../../lib/prisma";
import { generate2FASecret, generateQRCode, generateTemporaryOTP } from "@/lib/2fa";
import { TwoFactorType, RoleType } from "../../../../../../generated/prisma/enums";
import { sendEmail } from "@/lib/email";
import React from "react";
import OtpEmailTemplate from "@/features/auth/components/emails/OtpEmailTemplate";
import { DateTime } from "luxon";

/**
 * POST /api/auth/2fa/setup
 * Configure la 2FA pour l'utilisateur
 * Peut être appelé avec authentification (token) ou avec email (après changement de mot de passe)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, email } = body;

    if (!type || !Object.values(TwoFactorType).includes(type)) {
      return NextResponse.json(
        { error: "Type de 2FA invalide" },
        { status: 400 }
      );
    }

    let userId: string;

    // Si email fourni, c'est après changement de mot de passe (pas d'auth requise)
    if (email) {
      const userRecord = await prisma.user.findUnique({
        where: { email },
        include: {
          role: true,
        },
      });

      if (!userRecord) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      // Vérifications de sécurité : doit avoir changé le mot de passe et être actif
      if (userRecord.mustChangePassword) {
        return NextResponse.json(
          { error: "Vous devez d'abord changer votre mot de passe" },
          { status: 403 }
        );
      }

      if (!userRecord.emailVerifiedAt) {
        return NextResponse.json(
          { error: "Email non vérifié" },
          { status: 403 }
        );
      }

      // Vérifier que c'est SUPERADMIN ou DIRECTEUR (2FA obligatoire)
      const roleType = userRecord.role.type;
      if (roleType !== RoleType.SUPERADMIN && roleType !== RoleType.DIRECTEUR) {
        return NextResponse.json(
          { error: "L'authentification à deux facteurs n'est pas obligatoire pour votre rôle" },
          { status: 403 }
        );
      }

      if (userRecord.isTwoFactor) {
        return NextResponse.json(
          { error: "La 2FA est déjà activée" },
          { status: 400 }
        );
      }

      userId = userRecord.id;
    } else {
      // Sinon, vérifier l'authentification normale
      const authError = await authMiddleware(req);
      if (authError) return authError;

      const user = (req as { user?: { id: string } }).user;
      if (!user) {
        return NextResponse.json(
          { error: "Authentification requise" },
          { status: 401 }
        );
      }
      userId = user.id;

      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, fullName: true, isTwoFactor: true },
      });

      if (!userRecord) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      if (userRecord.isTwoFactor) {
        return NextResponse.json(
          { error: "La 2FA est déjà activée" },
          { status: 400 }
        );
      }
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, isTwoFactor: true },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    let response: { type: TwoFactorType; secret?: string; qrCode?: string; message?: string } = { type };

    switch (type) {
      case TwoFactorType.TOTP:
        // Générer un secret et un QR code
        const { secret, otpauthUrl } = generate2FASecret(userRecord.email);
        const qrCode = await generateQRCode(otpauthUrl!);

        // Sauvegarder temporairement le secret (non confirmé)
        await prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorSecret: secret,
            twoFactorType: type,
          },
        });

        response = {
          ...response,
          secret,
          qrCode,
          message: "Scannez le QR code avec votre application d'authentification",
        };
        break;

      case TwoFactorType.EMAIL:
        // Générer et envoyer un OTP par email
        const otpCode = generateTemporaryOTP();
        const expiresAt = DateTime.now().plus({ minutes: 10 });

        await prisma.otp.create({
          data: {
            userId: userId,
            code: otpCode,
            expiresAt: expiresAt.toJSDate(),
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { twoFactorType: type },
        });

        await sendEmail(
          userRecord.email,
          "Configuration de la 2FA - Code de vérification",
          React.createElement(OtpEmailTemplate, {
            fullName: userRecord.fullName,
            otpCode,
            expiresAt: expiresAt.toFormat("dd/MM/yyyy HH:mm"),
          })
        );

        response = {
          ...response,
          message: "Un code de vérification a été envoyé à votre email",
        };
        break;

      case TwoFactorType.SMS:
        // TODO: Implémenter l'envoi par SMS (nécessite un service comme Twilio)
        return NextResponse.json(
          { error: "SMS 2FA non encore implémenté" },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: "Type de 2FA non supporté" },
          { status: 400 }
        );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la configuration 2FA:", error);
    return NextResponse.json(
      { error: "Erreur lors de la configuration 2FA" },
      { status: 500 }
    );
  }
}
