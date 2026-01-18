import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, AuthenticatedRequest } from "@/middleware/auth";
import prisma from "../../../../../lib/prisma";
import { DateTime } from "luxon";

/**
 * GET /api/statistics/dashboard
 * Récupère les statistiques pour le dashboard
 */
export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const user = (req as AuthenticatedRequest).user!;
  

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30"; // jours
    const storeId = searchParams.get("storeId") || user.storeId;

    const startDate = DateTime.now().minus({ days: parseInt(period) }).toJSDate();

    // Filtres selon le rôle
    const where: {
      companyId?: string;
      storeId?: string;
      createdAt?: { gte: Date };
    } = {};

    const userRoleType = user.role?.type || "";

    if (userRoleType !== "SUPERADMIN") {
      where.companyId = user.companyId;
    }

    if (storeId && userRoleType !== "SUPERADMIN" && userRoleType !== "DIRECTEUR") {
      where.storeId = storeId;
    }

    // 1. Statistiques générales
    const [
      totalSales,
      totalRevenue,
      totalProducts,
      totalLowStock,
      recentSales,
      topProducts,
    ] = await Promise.all([
      // Nombre de ventes
      prisma.sale.count({
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
      }),

      // Revenu total
      prisma.sale.aggregate({
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
        _sum: {
          total: true,
        },
      }),

      // Nombre de produits (filtrer par companyId seulement si pas SUPERADMIN)
      prisma.product.count({
        where: {
          ...(userRoleType !== "SUPERADMIN" && user.companyId ? { companyId: user.companyId } : {}),
          isActive: true,
        },
      }),

      // Produits en stock faible (filtrer par companyId seulement si pas SUPERADMIN)
      prisma.stock.count({
        where: {
          ...(userRoleType !== "SUPERADMIN" && user.companyId
            ? {
                product: {
                  companyId: user.companyId,
                },
              }
            : {}),
          quantity: {
            lte: prisma.stock.fields.minQuantity,
          },
          ...(storeId && userRoleType !== "SUPERADMIN" && userRoleType !== "DIRECTEUR" ? { storeId } : {}),
        },
      }),

      // Ventes récentes (avec gestion d'erreur pour éviter les timeouts)
      prisma.sale
        .findMany({
          where: {
            ...where,
            createdAt: { gte: startDate },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            saleNumber: true,
            total: true,
            createdAt: true,
            store: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                fullName: true,
              },
            },
          },
        })
        .catch(() => []), // Retourner un tableau vide en cas d'erreur/timeout

      // Produits les plus vendus (avec gestion d'erreur si aucune donnée)
      prisma.saleItem
        .groupBy({
          by: ["productId"],
          where: {
            sale: {
              ...where,
              createdAt: { gte: startDate },
            },
          },
          _sum: {
            quantity: true,
            total: true,
          },
          orderBy: {
            _sum: {
              quantity: "desc",
            },
          },
          take: 5,
        })
        .catch(() => []), // Retourner un tableau vide en cas d'erreur
    ]);

    // 2. Enrichir les top produits avec leurs données
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
            sellingPrice: true,
          },
        });

        return {
          product,
          quantity: item._sum.quantity,
          revenue: item._sum.total,
        };
      })
    );

    // 3. Ventes par jour (graphique) - Revenus totaux
    // Utiliser une requête raw pour grouper par jour car groupBy ne supporte pas les dates directement
    let salesByDayRaw: Array<{ date: string; total: number }> = [];
    try {
      if (userRoleType === "SUPERADMIN") {
        salesByDayRaw = await prisma.$queryRaw<
          Array<{ date: string; total: number }>
        >`
          SELECT DATE("createdAt") as date, SUM("total")::float as total
          FROM "Sale"
          WHERE "createdAt" >= ${startDate}
          GROUP BY DATE("createdAt")
          ORDER BY DATE("createdAt") ASC
        `;
      } else if (user.companyId) {
        salesByDayRaw = await prisma.$queryRaw<
          Array<{ date: string; total: number }>
        >`
          SELECT DATE("createdAt") as date, SUM("total")::float as total
          FROM "Sale"
          WHERE "createdAt" >= ${startDate} AND "companyId" = ${user.companyId}
          GROUP BY DATE("createdAt")
          ORDER BY DATE("createdAt") ASC
        `;
      }
    } catch (error) {
      console.error("Erreur lors du groupage des ventes par jour:", error);
      salesByDayRaw = [];
    }

    // Formater les données pour le graphique (grouper par jour)
    const revenueByDay: Array<{ date: string; revenue: number }> = [];
    const dayMap = new Map<string, number>();

    salesByDayRaw.forEach((row) => {
      const date = row.date;
      const revenue = Number(row.total || 0);
      dayMap.set(date, revenue);
    });

    // Créer un tableau avec toutes les dates de la période
    const dates: string[] = [];
    for (let i = parseInt(period) - 1; i >= 0; i--) {
      const date = DateTime.now().minus({ days: i }).toISODate();
      if (date) {
        dates.push(date);
        if (!dayMap.has(date)) {
          dayMap.set(date, 0);
        }
      }
    }

    dates.forEach((date) => {
      revenueByDay.push({
        date,
        revenue: dayMap.get(date) || 0,
      });
    });

    // 4. Revenus par entreprise (pour SuperAdmin uniquement)
    let revenueByCompany: Array<{ companyName: string; revenue: number }> = [];
    if (userRoleType === "SUPERADMIN") {
      const companiesRevenue = await prisma.sale.groupBy({
        by: ["companyId"],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: {
          total: true,
        },
      });

      // Enrichir avec les noms d'entreprises
      revenueByCompany = await Promise.all(
        companiesRevenue.map(async (item) => {
          const company = await prisma.company.findUnique({
            where: { id: item.companyId },
            select: { companyName: true },
          });

          return {
            companyName: company?.companyName || "Entreprise inconnue",
            revenue: Number(item._sum.total || 0),
          };
        })
      );

      // Trier par revenus décroissants
      revenueByCompany.sort((a, b) => b.revenue - a.revenue);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            totalSales,
            totalRevenue: Number(totalRevenue._sum.total || 0),
            totalProducts,
            totalLowStock,
          },
          recentSales,
          topProducts: topProductsWithDetails,
          revenueByDay,
          revenueByCompany,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
