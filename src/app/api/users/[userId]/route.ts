import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../lib/prisma";
import { RoleType } from "../../../../../generated/prisma/enums";

/**
 * GET /api/users/[userId]
 * Récupère les détails d'un membre de l'équipe (GERANT, VENDEUR, MAGASINIER)
 * Un directeur ne peut voir que les membres de sa propre entreprise
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "users", "read");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;
  const { userId } = await params;

  try {
    // Récupérer les rôles GERANT, VENDEUR, MAGASINIER
    const teamRoles = await prisma.role.findMany({
      where: {
        type: {
          in: [RoleType.GERANT, RoleType.VENDEUR, RoleType.MAGASINIER],
        },
      },
    });

    const teamRoleIds = teamRoles.map((role) => role.id);

    // Construire la clause where avec vérification d'accès
    const where: {
      id: string;
      companyId?: string;
      roleId: { in: string[] };
    } = {
      id: userId,
      roleId: { in: teamRoleIds },
    };

    // Isolation par entreprise : un directeur ne peut voir que ses propres membres
    if (user.role?.type !== RoleType.SUPERADMIN) {
      if (!user.companyId) {
        return NextResponse.json(
          { error: "Vous devez avoir un commerce pour voir les détails d'un membre" },
          { status: 400 }
        );
      }
      where.companyId = user.companyId;
    }

    const userRecord = await prisma.user.findFirst({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: "Membre non trouvé ou accès non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: userRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du membre" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[userId]
 * Met à jour le statut actif/inactif d'un membre (suspendre/activer le compte)
 * Un directeur ne peut modifier que les membres de sa propre entreprise
 * Seul isActive peut être modifié (pas les autres informations)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "users", "update");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;
  const { userId } = await params;

  try {
    const body = await req.json();
    const { isActive } = body;

    // Vérifier que seul isActive est fourni
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "Le champ isActive est requis et doit être un booléen" },
        { status: 400 }
      );
    }

    // Récupérer les rôles GERANT, VENDEUR, MAGASINIER
    const teamRoles = await prisma.role.findMany({
      where: {
        type: {
          in: [RoleType.GERANT, RoleType.VENDEUR, RoleType.MAGASINIER],
        },
      },
    });

    const teamRoleIds = teamRoles.map((role) => role.id);

    // Vérifier que le membre existe et appartient à l'entreprise du directeur
    const where: {
      id: string;
      companyId?: string;
      roleId: { in: string[] };
    } = {
      id: userId,
      roleId: { in: teamRoleIds },
    };

    // Isolation par entreprise
    if (user.role?.type !== RoleType.SUPERADMIN) {
      if (!user.companyId) {
        return NextResponse.json(
          { error: "Vous devez avoir un commerce pour modifier un membre" },
          { status: 400 }
        );
      }
      where.companyId = user.companyId;
    }

    const existingUser = await prisma.user.findFirst({
      where,
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Membre non trouvé ou accès non autorisé" },
        { status: 404 }
      );
    }

    // Mettre à jour uniquement isActive
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: updatedUser,
        message: isActive ? "Compte activé avec succès" : "Compte suspendu avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du membre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du membre" },
      { status: 500 }
    );
  }
}
