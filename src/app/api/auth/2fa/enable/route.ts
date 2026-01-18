import { NextRequest, NextResponse } from "next/server";
import { authMiddleware } from "@/middleware/auth";
import prisma from "../../../../../../lib/prisma";
import { verifyTOTP, isOTPExpired } from "@/lib/2fa";
import { TwoFactorType, RoleType } from "../../../../../../generated/prisma/enums";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";

/**
 * POST /api/auth/2fa/enable
 * Active la 2FA après vérification du code
 * Peut être appelé avec authentification (token) ou avec email (après changement de mot de passe)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Code de vérification requis" },
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

      userId = userRecord.id;
    } else {
      // Sinon, vérifier l'authentification normale
      const authError = await authMiddleware(req);
      if (authError) return authError;

      const user = (req as { user?: { id: string } }).user;
      if (!user) {
        return NextResponse.json(
          { error: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }
      userId = user.id;
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
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

    if (userRecord.isTwoFactor) {
      return NextResponse.json(
        { error: "La 2FA est déjà activée" },
        { status: 400 }
      );
    }

    if (!userRecord.twoFactorType) {
      return NextResponse.json(
        { error: "Aucune configuration 2FA en cours" },
        { status: 400 }
      );
    }

    let isValid = false;

    switch (userRecord.twoFactorType) {
      case TwoFactorType.TOTP:
        if (!userRecord.twoFactorSecret) {
          return NextResponse.json(
            { error: "Secret 2FA non configuré" },
            { status: 400 }
          );
        }

        isValid = verifyTOTP(userRecord.twoFactorSecret, code);
        break;

      case TwoFactorType.EMAIL:
        // Vérifier l'OTP dans la base de données
        const otpRecord = await prisma.otp.findFirst({
          where: {
            userId: userId,
            code,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (!otpRecord) {
          return NextResponse.json(
            { error: "Code invalide" },
            { status: 400 }
          );
        }

        if (isOTPExpired(otpRecord.expiresAt)) {
          return NextResponse.json(
            { error: "Code expiré" },
            { status: 400 }
          );
        }

        isValid = true;

        // Supprimer l'OTP après utilisation pour éviter la réutilisation
        await prisma.otp.delete({
          where: { id: otpRecord.id },
        });
        break;

      default:
        return NextResponse.json(
          { error: "Type de 2FA non supporté" },
          { status: 400 }
        );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Code invalide" },
        { status: 400 }
      );
    }

    // Activer la 2FA et récupérer l'utilisateur complet
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactor: true,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        company: true,
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
          },
        },
      },
    });

    // Générer les tokens après activation de la 2FA
    const accessToken = generateAccessToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      companyId: updatedUser.companyId,
      roleId: updatedUser.roleId,
      roleName: updatedUser.role.name,
    });

    const refreshToken = generateRefreshToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      companyId: updatedUser.companyId,
      roleId: updatedUser.roleId,
      roleName: updatedUser.role.name,
    });

    // Récupérer les permissions
    const permissions = updatedUser.role.permissions.map((rp) => ({
      id: rp.permission.id,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description,
    }));

    // Déterminer la route de redirection
    const getDashboardRoute = (roleType: RoleType): string => {
      switch (roleType) {
        case RoleType.SUPERADMIN:
          return "/superadmin";
        case RoleType.DIRECTEUR:
          return "/admin";
        case RoleType.GERANT:
        case RoleType.VENDEUR:
        case RoleType.MAGASINIER:
          return "/app";
        default:
          return "/app";
      }
    };

    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone || undefined,
      avatar: updatedUser.avatar || undefined,
      isActive: updatedUser.isActive,
      isTwoFactor: updatedUser.isTwoFactor,
      twoFactorType: updatedUser.twoFactorType,
      role: {
        id: updatedUser.role.id,
        name: updatedUser.role.name,
        type: updatedUser.role.type,
        permissions,
      },
      company: updatedUser.company
        ? {
            id: updatedUser.company.id,
            slug: updatedUser.company.slug,
            companyName: updatedUser.company.companyName,
            businessType: updatedUser.company.businessType,
            country: updatedUser.company.country,
            logo: updatedUser.company.companyLogo || null,
            subscriptionStatus: updatedUser.company.subscriptionStatus,
            maxUsers: updatedUser.company.maxUsers,
            maxStores: updatedUser.company.maxStores,
          }
        : undefined,
      store: updatedUser.store
        ? {
            id: updatedUser.store.id,
            name: updatedUser.store.name,
            slug: updatedUser.store.slug,
            address: updatedUser.store.address || undefined,
          }
        : undefined,
      redirectTo: getDashboardRoute(updatedUser.role.type),
    };

    // Mettre à jour lastLoginAt
    await prisma.user.update({
      where: { id: updatedUser.id },
      data: { lastLoginAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "auth.2fa_enabled",
        resource: "user",
        resourceId: updatedUser.id,
        details: JSON.stringify({ email: updatedUser.email, type: updatedUser.twoFactorType }),
        userId: updatedUser.id,
        companyId: updatedUser.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json(
      {
        message: "2FA activée avec succès",
        user: userResponse,
        accessToken,
        refreshToken,
        redirectTo: userResponse.redirectTo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'activation de la 2FA:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'activation de la 2FA" },
      { status: 500 }
    );
  }
}
