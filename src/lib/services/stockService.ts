import prisma from "../../../lib/prisma";
import { emitStockUpdate, emitLowStockAlert } from "../websocket/server";

export interface StockUpdateData {
  productId: string;
  storeId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  userId: string;
  notes?: string;
  saleId?: string;
}

/**
 * Service de gestion des stocks avec transactions atomiques
 */
export class StockService {
  /**
   * Met à jour le stock d'un produit de manière atomique
   * Utilise une transaction Prisma pour garantir la cohérence
   */
  static async updateStock(data: StockUpdateData): Promise<any> {
    const { productId, storeId, quantity, type, reason, userId, notes, saleId } = data;

    return await prisma.$transaction(async (tx) => {
      // 1. Verrouiller le stock pour éviter les conditions de course
      const currentStock = await tx.stock.findUnique({
        where: {
          productId_storeId: {
            productId,
            storeId,
          },
        },
        include: {
          product: {
            select: {
              name: true,
              companyId: true,
            },
          },
        },
      });

      if (!currentStock) {
        throw new Error("Stock non trouvé");
      }

      const oldQuantity = currentStock.quantity;
      let newQuantity: number;

      // 2. Calculer la nouvelle quantité
      if (type === "IN") {
        newQuantity = oldQuantity + quantity;
      } else {
        // OUT
        newQuantity = oldQuantity - quantity;

        // Vérifier qu'il y a assez de stock
        if (newQuantity < 0) {
          throw new Error(
            `Stock insuffisant. Disponible: ${oldQuantity}, Demandé: ${quantity}`
          );
        }
      }

      // 3. Mettre à jour le stock
      const updatedStock = await tx.stock.update({
        where: {
          productId_storeId: {
            productId,
            storeId,
          },
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
          store: true,
        },
      });

      // 4. Enregistrer le mouvement de stock
      await tx.stockMovement.create({
        data: {
          productId,
          storeId,
          userId,
          type,
          quantity,
          reason,
          notes,
          saleId,
        },
      });

      // 5. Émettre l'événement WebSocket
      try {
        emitStockUpdate(
          currentStock.product.companyId,
          storeId,
          {
            productId,
            oldQuantity,
            newQuantity,
            reason,
          }
        );

        // 6. Vérifier si le stock est en dessous du seuil minimum
        if (newQuantity <= currentStock.minQuantity) {
          emitLowStockAlert(
            currentStock.product.companyId,
            storeId,
            {
              productId,
              productName: currentStock.product.name,
              currentQuantity: newQuantity,
              minQuantity: currentStock.minQuantity,
            }
          );
        }
      } catch (wsError) {
        // Ne pas bloquer la transaction si le WebSocket échoue
        console.error("Erreur WebSocket:", wsError);
      }

      return updatedStock;
    });
  }

  /**
   * Ajuste le stock manuellement (inventaire)
   */
  static async adjustStock(
    productId: string,
    storeId: string,
    newQuantity: number,
    userId: string,
    notes?: string
  ): Promise<any> {
    return await prisma.$transaction(async (tx) => {
      const currentStock = await tx.stock.findUnique({
        where: {
          productId_storeId: {
            productId,
            storeId,
          },
        },
        include: {
          product: {
            select: {
              name: true,
              companyId: true,
            },
          },
        },
      });

      if (!currentStock) {
        throw new Error("Stock non trouvé");
      }

      const oldQuantity = currentStock.quantity;
      const difference = newQuantity - oldQuantity;

      // Mettre à jour le stock
      const updatedStock = await tx.stock.update({
        where: {
          productId_storeId: {
            productId,
            storeId,
          },
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
          store: true,
        },
      });

      // Enregistrer le mouvement
      await tx.stockMovement.create({
        data: {
          productId,
          storeId,
          userId,
          type: difference > 0 ? "IN" : "OUT",
          quantity: Math.abs(difference),
          reason: "adjustment",
          notes: notes || "Ajustement manuel d'inventaire",
        },
      });

      // Émettre l'événement WebSocket
      try {
        emitStockUpdate(
          currentStock.product.companyId,
          storeId,
          {
            productId,
            oldQuantity,
            newQuantity,
            reason: "adjustment",
          }
        );

        if (newQuantity <= currentStock.minQuantity) {
          emitLowStockAlert(
            currentStock.product.companyId,
            storeId,
            {
              productId,
              productName: currentStock.product.name,
              currentQuantity: newQuantity,
              minQuantity: currentStock.minQuantity,
            }
          );
        }
      } catch (wsError) {
        console.error("Erreur WebSocket:", wsError);
      }

      return updatedStock;
    });
  }

  /**
   * Récupère l'historique des mouvements de stock
   */
  static async getStockHistory(
    productId: string,
    storeId?: string,
    limit: number = 50
  ) {
    const where: any = { productId };

    if (storeId) {
      where.product = {
        stocks: {
          some: {
            storeId,
          },
        },
      };
    }

    return await prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  /**
   * Récupère les produits en stock faible
   */
  static async getLowStockProducts(companyId: string, storeId?: string) {
    const where: any = {
      product: {
        companyId,
      },
    };

    if (storeId) {
      where.storeId = storeId;
    }

    return await prisma.stock.findMany({
      where: {
        ...where,
        quantity: {
          lte: prisma.stock.fields.minQuantity,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        quantity: "asc",
      },
    });
  }
}
