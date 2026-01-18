"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { ShoppingBag, DollarSign, Package, AlertTriangle, ShoppingCart } from "lucide-react";
import { RoleType } from "@/lib/constants/roles";
import { RouteNames } from "@/lib/enums";
import { getAppRouteName } from "@/lib/constants";

export default function StaffDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { stats, isLoading: statsLoading } = useDashboardStats("30", user?.store?.id);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(getAppRouteName(RouteNames.login));
      return;
    }

    if (user) {
      // Rediriger les SuperAdmin et Directeurs vers leurs dashboards
      const roleType = user.role.type || user.role.name?.toUpperCase() || "";
      if (roleType === RoleType.SUPERADMIN || user.role.name?.toUpperCase() === RoleType.SUPERADMIN) {
        router.push("/superadmin");
        return;
      }
      if (roleType === RoleType.DIRECTEUR || user.role.name?.toUpperCase() === RoleType.DIRECTEUR) {
        router.push("/admin");
        return;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleType = user.role.type || user.role.name?.toUpperCase() || "";
  const isVendeur = roleType === RoleType.VENDEUR || user.role.name?.toUpperCase() === RoleType.VENDEUR;
  const isMagasinier = roleType === RoleType.MAGASINIER || user.role.name?.toUpperCase() === RoleType.MAGASINIER;
  const isGerant = roleType === RoleType.GERANT || user.role.name?.toUpperCase() === RoleType.GERANT;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isGerant ? "Tableau de bord Gérant" : isVendeur ? "Tableau de bord Vendeur" : "Tableau de bord Magasinier"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user.store?.name ? `Magasin: ${user.store.name}` : "Tableau de bord"}
            </p>
          </div>
          {isVendeur && (
            <Button onClick={() => router.push("/app/pos")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ouvrir la caisse
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isVendeur && (
                <>
                  <StatCard
                    title="Mes ventes"
                    value={stats.summary.totalSales}
                    description="Sur les 30 derniers jours"
                    icon={<ShoppingBag className="h-5 w-5" />}
                  />
                  <StatCard
                    title="Mon chiffre d'affaires"
                    value={new Intl.NumberFormat("fr-FR", {
                      style: "currency",
                      currency: "XOF",
                    }).format(stats.summary.totalRevenue)}
                    description="Sur les 30 derniers jours"
                    icon={<DollarSign className="h-5 w-5" />}
                  />
                </>
              )}
              {(isGerant || isMagasinier) && (
                <StatCard
                  title="Produits en stock"
                  value={stats.summary.totalProducts}
                  description="Produits disponibles"
                  icon={<Package className="h-5 w-5" />}
                />
              )}
              {(isGerant || isMagasinier) && (
                <StatCard
                  title="Stock faible"
                  value={stats.summary.totalLowStock}
                  description="Produits nécessitant une réapprovisionnement"
                  icon={<AlertTriangle className="h-5 w-5" />}
                />
              )}
              {isVendeur && (
                <>
                  <StatCard
                    title="Produits disponibles"
                    value={stats.summary.totalProducts}
                    description="Dans le catalogue"
                    icon={<Package className="h-5 w-5" />}
                  />
                  <StatCard
                    title="Alertes stock"
                    value={stats.summary.totalLowStock}
                    description="Produits en rupture"
                    icon={<AlertTriangle className="h-5 w-5" />}
                  />
                </>
              )}
            </div>

            {/* Quick Actions based on role */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {isVendeur && (
                    <>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/pos")}
                      >
                        <ShoppingCart className="h-6 w-6 mb-2" />
                        Nouvelle vente
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/sales")}
                      >
                        <ShoppingBag className="h-6 w-6 mb-2" />
                        Mes ventes
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/products")}
                      >
                        <Package className="h-6 w-6 mb-2" />
                        Voir les produits
                      </Button>
                    </>
                  )}
                  {(isGerant || isMagasinier) && (
                    <>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/stock")}
                      >
                        <Package className="h-6 w-6 mb-2" />
                        Gérer le stock
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/stock/movements")}
                      >
                        <AlertTriangle className="h-6 w-6 mb-2" />
                        Mouvements de stock
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={() => router.push("/app/products")}
                      >
                        <Package className="h-6 w-6 mb-2" />
                        Liste des produits
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Sales & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {isVendeur && (
                <RecentSalesTable
                  sales={stats.recentSales.map((sale) => ({
                    ...sale,
                    createdAt: new Date(sale.createdAt),
                  }))}
                />
              )}
              {isVendeur && <TopProductsTable products={stats.topProducts} />}
              {(isGerant || isMagasinier) && (
                <div className="lg:col-span-2">
                  <TopProductsTable products={stats.topProducts} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
