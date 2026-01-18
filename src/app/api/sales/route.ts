import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, permissionMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../lib/prisma";
import { emitSaleCompleted, emitStockUpdate } from "@/lib/websocket/server";

/**
 * GET /api/sales
 * Liste toutes les ventes
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "sales", "list");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const storeId = searchParams.get("storeId") || user.storeId;
    const skip = (page - 1) * limit;

    const where: {
      companyId?: string;
      storeId?: string;
    } = {};

    // SuperAdmin peut voir toutes les ventes, sinon filtrer par entreprise
    if (user.role?.type !== "SUPERADMIN") {
      where.companyId = user.companyId;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  image: true,
                },
              },
            },
          },
          store: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: sales,
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
    console.error("Erreur lors de la récupération des ventes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des ventes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales
 * Créer une nouvelle vente avec transaction atomique
 */
export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const permError = await permissionMiddleware(req as AuthenticatedRequest, "sales", "create");
  if (permError) return permError;

  const user = (req as AuthenticatedRequest).user!;

  try {
    const body = await req.json();
    const {
      items,
      paymentMethod,
      paymentReference,
      customerName,
      customerPhone,
      customerEmail,
      discount,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Aucun article dans la vente" },
        { status: 400 }
      );
    }

    if (!user.storeId) {
      return NextResponse.json(
        { error: "Aucun magasin assigné à l'utilisateur" },
        { status: 400 }
      );
    }

    // Transaction atomique pour créer la vente et déduire les stocks
    const transactionResult = await prisma.$transaction(async (tx) => {
      // 1. Générer le numéro de vente unique
      const saleCount = await tx.sale.count({
        where: { companyId: user.companyId },
      });
      const saleNumber = `SALE-${Date.now()}-${saleCount + 1}`;

      // 2. Calculer les totaux et vérifier les stocks
      let subtotal = 0;
      let taxAmount = 0;
      const saleItemsData = [];

      for (const item of items) {
        // Vérifier le produit
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produit ${item.productId} non trouvé`);
        }

        // Vérifier le stock
        const stock = await tx.stock.findUnique({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: user.storeId!,
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(
            `Stock insuffisant pour ${product.name}. Disponible: ${stock?.quantity || 0}, Demandé: ${item.quantity}`
          );
        }

        // Calculer les montants
        const itemSubtotal = item.quantity * Number(product.sellingPrice);
        const itemTaxAmount = (itemSubtotal * Number(product.taxRate)) / 100;
        const itemTotal = itemSubtotal + itemTaxAmount;

        subtotal += itemSubtotal;
        taxAmount += itemTaxAmount;

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          taxRate: product.taxRate,
          subtotal: itemSubtotal,
          taxAmount: itemTaxAmount,
          total: itemTotal,
        });
      }

      const total = subtotal + taxAmount - (discount || 0);

      // 3. Créer la vente
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          subtotal,
          taxAmount,
          discount: discount || 0,
          total,
          paymentMethod,
          paymentReference,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          companyId: user.companyId!,
          storeId: user.storeId!,
          userId: user.id,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 4. Déduire les stocks et collecter les informations pour WebSocket
      const stockUpdates: Array<{
        productId: string;
        oldQuantity: number;
        newQuantity: number;
      }> = [];

      for (const item of items) {
        // Récupérer le stock actuel avant la mise à jour
        const currentStock = await tx.stock.findUnique({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: user.storeId!,
            },
          },
        });

        const oldQuantity = currentStock?.quantity || 0;

        // Mettre à jour le stock
        const updatedStock = await tx.stock.update({
          where: {
            productId_storeId: {
              productId: item.productId,
              storeId: user.storeId!,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        stockUpdates.push({
          productId: item.productId,
          oldQuantity,
          newQuantity: updatedStock.quantity,
        });

        // Enregistrer le mouvement de stock
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            storeId: user.storeId!,
            userId: user.id,
            type: "OUT",
            quantity: item.quantity,
            reason: "sale",
            saleId: newSale.id,
          },
        });
      }

      return { sale: newSale, stockUpdates };
    });

    const { sale, stockUpdates } = transactionResult;

    // 5. Émettre les événements WebSocket
    try {
      // Émettre la vente complétée
      emitSaleCompleted(user.companyId!, user.storeId!, {
        saleId: sale.id,
        saleNumber: sale.saleNumber,
        total: Number(sale.total),
        items: sale.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          total: Number(item.total),
        })),
      });

      // Émettre les mises à jour de stock pour chaque produit
      for (const stockUpdate of stockUpdates) {
        emitStockUpdate(user.companyId!, user.storeId!, {
          productId: stockUpdate.productId,
          oldQuantity: stockUpdate.oldQuantity,
          newQuantity: stockUpdate.newQuantity,
          reason: "sale",
        });
      }
    } catch (wsError) {
      console.error("Erreur WebSocket:", wsError);
    }

    // 6. Audit log
    await prisma.auditLog.create({
      data: {
        action: "sale.created",
        resource: "sale",
        resourceId: sale.id,
        details: JSON.stringify({ saleNumber: sale.saleNumber, total: sale.total }),
        userId: user.id,
        companyId: user.companyId,
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sale,
        message: "Vente créée avec succès",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création de la vente";
    console.error("Erreur lors de la création de la vente:", error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
