import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../lib/prisma";

/**
 * GET /api/products/[id]
 * Récupère les détails d'un produit avec ses stocks et magasins
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "products", "read");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;
  const { id } = await params;

  try {
    // Construire la clause where avec vérification d'accès
    const where: { id: string; companyId?: string } = { id };

    // SuperAdmin peut voir tous les produits, sinon filtrer par entreprise
    if (user.role?.type !== "SUPERADMIN") {
      where.companyId = user.companyId;
    }

    // Récupérer le produit avec ses relations
    const product = await prisma.product.findFirst({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
          },
        },
        stocks: {
          include: {
            store: {
              select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                phone: true,
                email: true,
              },
            },
          },
          orderBy: {
            quantity: "desc",
          },
        },
        _count: {
          select: {
            saleItems: true,
            stockMovements: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}
