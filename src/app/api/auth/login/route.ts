import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { verifyPassword } from "@/lib/security";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { TwoFactorType, RoleType } from "../../../../../generated/prisma/enums";
import { sendEmail } from "@/lib/email";
import React from "react";
import OtpEmailTemplate from "@/features/auth/components/emails/OtpEmailTemplate";
import { generateTemporaryOTP } from "@/lib/2fa";
import { DateTime } from "luxon";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec toutes ses relations
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // // Vérifier si le compte est actif
    // if (!user.isActive) {
    //   return NextResponse.json(
    //     { error: "Votre compte est désactivé" },
    //     { status: 403 }
    //   );
    // }

    // Vérifier si l'utilisateur doit changer son mot de passe
    if (user.mustChangePassword) {
      return NextResponse.json(
        {
          requires2FA: false,
          mustChangePassword: true,
          message: "Vous devez changer votre mot de passe",
          email: user.email,
        },
        { status: 200 }
      );
    }

    // 2FA OBLIGATOIRE pour SUPERADMIN et DIRECTEUR
    const roleType = user.role.type;
    const requires2FAMandatory = roleType === RoleType.SUPERADMIN || roleType === RoleType.DIRECTEUR;

    if (requires2FAMandatory && !user.isTwoFactor) {
      return NextResponse.json(
        {
          requires2FA: false,
          mustSetup2FA: true,
          message: "Vous devez activer l'authentification à deux facteurs pour accéder à l'administration",
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Vérifier la 2FA
    if (user.isTwoFactor) {
      // Générer et envoyer un code selon le type de 2FA
      if (user.twoFactorType === TwoFactorType.EMAIL) {
        const otpCode = generateTemporaryOTP();
        const expiresAt = DateTime.now().plus({ minutes: 10 });

        await prisma.otp.create({
          data: {
            userId: user.id,
            code: otpCode,
            expiresAt: expiresAt.toJSDate(),
          },
        });

        await sendEmail(
          user.email,
          "Code de vérification - TradeSphere",
          React.createElement(OtpEmailTemplate, {
            fullName: user.fullName,
            otpCode,
            expiresAt: expiresAt.toFormat("dd/MM/yyyy HH:mm"),
          })
        );
      }

      return NextResponse.json(
        {
          requires2FA: true,
          twoFactorType: user.twoFactorType,
          message: "Code de vérification requis",
          email: user.email,
        },
        { status: 200 }
      );
    }

    // Pas de 2FA - Connexion directe
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
        action: "auth.login",
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
        requires2FA: false,
        mustChangePassword: false,
        redirectTo: userResponse.redirectTo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
