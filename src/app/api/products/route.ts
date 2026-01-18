import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";

/**
 * GET /api/products
 * Liste tous les produits de l'entreprise
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "products", "list");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    // Pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const skip = (page - 1) * limit;

    const where: {
      companyId?: string;
      categoryId?: string;
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        sku?: { contains: string; mode: "insensitive" };
      }>;
    } = {};

    // SuperAdmin peut voir tous les produits, sinon filtrer par entreprise
    if (user.role?.type !== "SUPERADMIN") {
      where.companyId = user.companyId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
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
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Créer un nouveau produit
 */
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "products", "create");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const body = await req.json();
    const {
      sku,
      name,
      description,
      image,
      purchasePrice,
      sellingPrice,
      taxRate,
      categoryId,
      storeId, // OBLIGATOIRE : magasin où créer le stock initial
      initialQuantity = 0, // Quantité initiale (par défaut 0)
      minQuantity = 0,
      maxQuantity,
    } = body;

    // Validation : storeId est obligatoire
    if (!storeId) {
      return NextResponse.json(
        { error: "Le magasin (storeId) est requis pour créer un produit" },
        { status: 400 }
      );
    }

    // Vérifier que le magasin appartient à l'entreprise de l'utilisateur
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        companyId: user.companyId!,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Magasin non trouvé ou n'appartient pas à votre entreprise" },
        { status: 400 }
      );
    }

    // Vérifier que le SKU est unique dans l'entreprise
    const existingProduct = await prisma.product.findUnique({
      where: {
        companyId_sku: {
          companyId: user.companyId!,
          sku,
        },
      },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Ce SKU existe déjà" },
        { status: 400 }
      );
    }

    // Créer le produit ET le stock initial dans une transaction
    const product = await prisma.$transaction(async (tx) => {
      // Créer le produit
      const newProduct = await tx.product.create({
        data: {
          sku,
          name,
          description,
          image,
          purchasePrice,
          sellingPrice,
          taxRate: taxRate || 0,
          categoryId,
          companyId: user.companyId!,
        },
        include: {
          category: true,
        },
      });

      // Créer automatiquement le stock initial dans le magasin spécifié
      await tx.stock.create({
        data: {
          productId: newProduct.id,
          storeId,
          quantity: initialQuantity,
          minQuantity,
          maxQuantity: maxQuantity || undefined,
        },
      });

      return newProduct;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "product.created",
        resource: "product",
        resourceId: product.id,
        details: JSON.stringify({ name, sku }),
        userId: user.id,
        companyId: user.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Produit créé avec succès",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
