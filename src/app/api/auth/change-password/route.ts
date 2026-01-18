import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/security";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { RoleType } from "../../../../../generated/prisma/enums";
import { sendEmail } from "@/lib/email";
import React from "react";
import ChangedPasswordEmail from "@/features/auth/components/emails/ChangePasswordEmail";
import { authMiddleware } from "@/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, email } = body;

    // Validation des champs requis
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Le mot de passe actuel et le nouveau mot de passe sont obligatoires" },
        { status: 400 }
      );
    }

    // S'assurer que le mot de passe courant est différent du nouveau mot de passe
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien mot de passe" },
        { status: 400 }
      );
    }

    let userEmail: string | undefined = email;

    // Si pas d'email fourni, vérifier l'authentification (changement de mot de passe depuis un compte connecté)
    if (!userEmail) {
      const authError = await authMiddleware(req);
      if (authError) {
        return NextResponse.json(
          { error: "Vous devez être connecté ou fournir votre email pour changer votre mot de passe" },
          { status: 401 }
        );
      }
      const user = (req as { user?: { email: string } }).user;
      if (!user || !user.email) {
        return NextResponse.json(
          { error: "Impossible de récupérer votre email. Veuillez le fournir dans le formulaire." },
          { status: 401 }
        );
      }
      userEmail = user.email;
    }

    // S'assurer que le mot de passe courant est différent du nouveau mot de passe
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien" },
        { status: 400 }
      );
    }

    // Retrouver l'utilisateur avec ses relations
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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
        { error: `Aucun compte trouvé avec l'email ${userEmail}. Vérifiez votre adresse email.` },
        { status: 404 }
      );
    }

    // Vérifier si le mot de passe courant est correct
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Le mot de passe actuel que vous avez saisi est incorrect. Veuillez réessayer." },
        { status: 401 }
      );
    }

    // Mettre à jour le mot de passe et activer le compte
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(newPassword),
        emailVerifiedAt: new Date(),
        mustChangePassword: false,
        isActive: true,
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

    // Vérifier si 2FA obligatoire pour SUPERADMIN et DIRECTEUR
    const roleType = updatedUser.role.type;
    const requires2FAMandatory = roleType === RoleType.SUPERADMIN || roleType === RoleType.DIRECTEUR;

    // Si 2FA obligatoire et pas encore activée, NE PAS générer les tokens
    // L'utilisateur devra configurer la 2FA avant d'obtenir les tokens
    if (requires2FAMandatory && !updatedUser.isTwoFactor) {
      // Envoyer un email de notification de changement de mot de passe
      await sendEmail(
        updatedUser.email,
        "Mot de passe modifié - Configuration 2FA requise",
        React.createElement(ChangedPasswordEmail, {
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          changedAt: new Date().toDateString(),
        })
      );

      return NextResponse.json(
        {
          message: "Mot de passe modifié avec succès. Vous devez maintenant configurer l'authentification à deux facteurs.",
          mustSetup2FA: true,
          email: updatedUser.email,
        },
        { status: 200 }
      );
    }

    // 2FA pas obligatoire ou déjà activée → générer les tokens
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
      isTwoFactor: updatedUser.isTwoFactor ?? false,
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

    // Envoyer un email de notification de changement de mot de passe
    await sendEmail(
      updatedUser.email,
      "Mot de passe modifié",
      React.createElement(ChangedPasswordEmail, {
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        changedAt: new Date().toDateString(),
      })
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "auth.password_changed",
        resource: "user",
        resourceId: updatedUser.id,
        details: JSON.stringify({ email: updatedUser.email }),
        userId: updatedUser.id,
        companyId: updatedUser.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      },
    });

    return NextResponse.json(
      {
        message: "Mot de passe modifié avec succès",
        user: userResponse,
        accessToken,
        refreshToken,
        redirectTo: userResponse.redirectTo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passe:", error);
    
    // Gérer les erreurs spécifiques
    if (error instanceof Error) {
      // Erreurs Prisma
      if (error.name === "PrismaClientKnownRequestError") {
        return NextResponse.json(
          { error: "Une erreur s'est produite lors de la mise à jour de votre mot de passe. Veuillez réessayer." },
          { status: 500 }
        );
      }
      
      // Erreurs de validation
      if (error.message.includes("password")) {
        return NextResponse.json(
          { error: "Le format du mot de passe n'est pas valide. Assurez-vous qu'il respecte les critères requis." },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: "Une erreur inattendue s'est produite lors de la modification de votre mot de passe. Veuillez réessayer plus tard ou contacter le support si le problème persiste." },
      { status: 500 }
    );
  }
}
