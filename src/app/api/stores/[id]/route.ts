import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../lib/prisma";

/**
 * GET /api/stores/[id]
 * Récupère les détails d'un magasin avec ses produits (via stocks)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "stores", "read");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;
  const { id } = await params;

  try {
    // Construire la clause where avec vérification d'accès
    const where: { id: string; companyId?: string } = { id };

    // SuperAdmin peut voir tous les magasins, sinon filtrer par entreprise
    if (user.role?.type !== "SUPERADMIN") {
      where.companyId = user.companyId;
    }

    // Récupérer le magasin avec ses relations
    const store = await prisma.store.findFirst({
      where,
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
        stocks: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                image: true,
                sellingPrice: true,
                isActive: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            product: {
              name: "asc",
            },
          },
        },
        _count: {
          select: {
            users: true,
            stocks: true,
            sales: true,
            stockMovements: true,
          },
        },
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Magasin non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: store,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du magasin:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du magasin" },
      { status: 500 }
    );
  }
}
