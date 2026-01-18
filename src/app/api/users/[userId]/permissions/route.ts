import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../../lib/prisma";
import { RoleType } from "../../../../../../generated/prisma/enums";

/**
 * GET /api/users/:userId/permissions
 * Récupérer les permissions d'un utilisateur
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const { userId } = await params;
    const user = (req as AuthenticatedRequest).user;

    // Un utilisateur ne peut récupérer que ses propres permissions
    // sauf s'il est SUPERADMIN
    if (user?.id !== userId && user?.role?.type !== RoleType.SUPERADMIN) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer l'utilisateur avec ses permissions
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!userRecord) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Extraire les permissions de l'utilisateur
    const permissions = userRecord.role.permissions.map((rp) => ({
      id: rp.permission.id,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description,
    }));

    return NextResponse.json(
      {
        success: true,
        data: permissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des permissions" },
      { status: 500 }
    );
  }
}
