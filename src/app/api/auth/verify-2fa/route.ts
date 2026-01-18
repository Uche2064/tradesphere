import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { verifyTOTP, isOTPExpired } from "@/lib/2fa";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { TwoFactorType, RoleType } from "../../../../../generated/prisma/enums";

/**
 * POST /api/auth/verify-2fa
 * Vérifie le code 2FA et complète la connexion
 */
export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email et code requis" },
        { status: 400 }
      );
    }

    // Utiliser select au lieu de include pour optimiser la requête
    // Avec timeout de 25 secondes pour éviter que la requête ne reste bloquée
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatar: true,
          isActive: true,
          isTwoFactor: true,
          twoFactorSecret: true,
          twoFactorType: true,
          roleId: true,
          companyId: true,
          storeId: true,
          role: {
            select: {
              id: true,
              name: true,
              type: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      resource: true,
                      action: true,
                      description: true,
                    },
                  },
                },
              },
            },
          },
          company: {
            select: {
              id: true,
              slug: true,
              companyName: true,
              businessType: true,
              country: true,
              companyLogo: true,
              subscriptionStatus: true,
              maxUsers: true,
              maxStores: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              address: true,
            },
          },
        },
      }),
      // Timeout de 25 secondes pour éviter que la requête ne reste bloquée
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La requête a pris trop de temps')), 25000)
      ),
    ]);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé ou inactif" },
        { status: 404 }
      );
    }

    if (!user.isTwoFactor) {
      return NextResponse.json(
        { error: "2FA non activée pour cet utilisateur" },
        { status: 400 }
      );
    }

    let isValid = false;

    switch (user.twoFactorType) {
      case TwoFactorType.TOTP:
        if (!user.twoFactorSecret) {
          return NextResponse.json(
            { error: "Secret 2FA non configuré" },
            { status: 500 }
          );
        }

        isValid = verifyTOTP(user.twoFactorSecret, code);
        break;

      case TwoFactorType.EMAIL:
        // TODO: Restore OTP.type when schema is fixed
        const otpRecord = await prisma.otp.findFirst({
          where: {
            userId: user.id,
            code,
            // verified field doesn't exist in current schema
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

        // TODO: Restore verified field when schema is fixed
        // await prisma.otp.update({
        //   where: { id: otpRecord.id },
        //   data: { verified: true },
        // });
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

    // Mettre à jour lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Générer les tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
      roleName: user.role.name,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    // Récupérer les permissions de l'utilisateur
    const permissions = user.role.permissions.map((rp) => ({
      id: rp.permission.id,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description,
    }));

    // Déterminer la route de redirection selon le rôle
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

    // Construire la réponse utilisateur
    const userResponse = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive ?? false,
      isTwoFactor: user.isTwoFactor ?? false,
      twoFactorType: user.twoFactorType,
      role: {
        id: user.role.id,
        name: user.role.name,
        type: user.role.type,
        permissions,
      },
      company: user.company
        ? {
            id: user.company.id,
            slug: user.company.slug,
            companyName: user.company.companyName,
            businessType: user.company.businessType,
            country: user.company.country,
            logo: user.company.companyLogo || null,
            subscriptionStatus: user.company.subscriptionStatus,
            maxUsers: user.company.maxUsers,
            maxStores: user.company.maxStores,
          }
        : undefined,
      store: user.store
        ? {
            id: user.store.id,
            name: user.store.name,
            slug: user.store.slug,
            address: user.store.address || undefined,
          }
        : undefined,
      redirectTo: getDashboardRoute(user.role.type),
    };

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "auth.verify_2fa",
        resource: "user",
        resourceId: user.id,
        details: JSON.stringify({ email: user.email, roleType: user.role.type }),
        userId: user.id,
        companyId: user.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json(
      {
        message: "Connexion réussie",
        user: userResponse,
        accessToken,
        refreshToken,
        redirectTo: userResponse.redirectTo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la vérification 2FA:", error);
    
    // Gestion spécifique des erreurs de timeout
    if (error instanceof Error) {
      if (error.message.includes('Timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          { error: "La requête a pris trop de temps. Veuillez réessayer." },
          { status: 504 } // Gateway Timeout
        );
      }
      
      // Gestion des erreurs Prisma
      if (error.message.includes('P2002') || error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: "Une erreur de contrainte unique s'est produite" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Erreur lors de la vérification. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
