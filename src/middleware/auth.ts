import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import prisma from "../../lib/prisma";
import { RoleType } from "../../generated/prisma/enums";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    roleId: string;
    companyId?: string;
    storeId?: string;
    role?: {
      type: string;
    };
  };
}

/**
 * Middleware d'authentification
 * Vérifie le JWT et charge l'utilisateur
 */
export async function authMiddleware(req: NextRequest) {
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

    // Vérifier que l'utilisateur existe et est actif
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        isActive: true,
        roleId: true,
        companyId: true,
        storeId: true,
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

    // Attacher l'utilisateur à la requête (convertir null en undefined pour la compatibilité)
    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      companyId: user.companyId ?? undefined,
      storeId: user.storeId ?? undefined,
      role: {
        type: user.role.type,
      },
    };

    return null; // Continuer
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return NextResponse.json(
      { error: "Token invalide ou expiré" },
      { status: 401 }
    );
  }
}

/**
 * Middleware d'isolation Multi-company
 * S'assure qu'un utilisateur ne peut accéder qu'aux données de son entreprise
 */
export async function companyMiddleware(req: AuthenticatedRequest, companyId: string) {
  const user = req.user;

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  // SuperAdmin peut accéder à toutes les entreprises
  if (user.role?.type === RoleType.SUPERADMIN) {
    return null; // Autoriser
  }

  // Vérifier que l'utilisateur appartient à l'entreprise demandée
  if (user.companyId !== companyId) {
    return NextResponse.json(
      { error: "Accès non autorisé à cette entreprise" },
      { status: 403 }
    );
  }

  return null; // Autoriser
}

/**
 * Middleware de vérification des permissions
 */
export async function permissionMiddleware(
  req: AuthenticatedRequest,
  resource: string,
  action: string
) {
  const user = req.user;

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  // Charger les informations de l'utilisateur et de son rôle avec les permissions
  const userPermissions = await prisma.user.findUnique({
    where: { id: user.id },
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
    },
  });

  if (!userPermissions) {
    return NextResponse.json(
      { error: "Utilisateur non trouvé" },
      { status: 404 }
    );
  }

  // SuperAdmin a tous les droits
  if (userPermissions.role.type === RoleType.SUPERADMIN) {
    return null; // Autoriser
  }

  // Vérifier si l'utilisateur a la permission requise
  const hasPermission = userPermissions.role.permissions.some(
    (rp) => rp.permission.resource === resource && rp.permission.action === action
  );

  if (!hasPermission) {
    return NextResponse.json(
      { error: "Permission insuffisante" },
      { status: 403 }
    );
  }

  return null; // Autoriser
}
