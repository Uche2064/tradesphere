import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";
import { RoleType } from "../../../../generated/prisma/enums";

/**
 * GET /api/team
 * Liste les membres de l'équipe (GERANT, VENDEUR, MAGASINIER) pour le Directeur
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "users", "list");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  // Vérifier que l'utilisateur a une entreprise (doit être DIRECTEUR)
  if (!user.companyId) {
    return NextResponse.json(
      { error: "Vous devez avoir un commerce pour voir votre équipe" },
      { status: 400 }
    );
  }

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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    // IMPORTANT : Isolation des données par entreprise
    // Le companyId vient directement de l'utilisateur authentifié (via JWT)
    // Cela garantit qu'un directeur ne peut voir QUE les membres de sa propre entreprise
    // Aucun paramètre de requête ne peut modifier ce filtre car il vient du token JWT vérifié
    const whereClause: {
      companyId: string;
      roleId: { in: string[] };
      OR?: Array<{
        fullName?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      companyId: user.companyId, // Filtre strict : uniquement l'entreprise de l'utilisateur authentifié
      roleId: { in: teamRoleIds },
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de l'équipe:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'équipe" },
      { status: 500 }
    );
  }
}
