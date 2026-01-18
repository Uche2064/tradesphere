"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";
import { TopProductsTable } from "@/components/dashboard/TopProductsTable";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { ShoppingBag, DollarSign, Package, AlertTriangle, Users, Store } from "lucide-react";

export default function DirectorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { stats } = useDashboardStats("30");

  // Le layout gère déjà l'authentification et les redirections
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord Directeur</h1>
            <p className="text-muted-foreground mt-1">
              Gestion de votre entreprise
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/admin/team")}>
              <Users className="h-4 w-4 mr-2" />
              Gérer l&apos;équipe
            </Button>
            <Button variant="outline" onClick={() => router.push("/admin/stores")}>
              <Store className="h-4 w-4 mr-2" />
              Gérer les magasins
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Ventes"
                value={stats.summary.totalSales}
                description="Sur les 30 derniers jours"
                icon={<ShoppingBag className="h-5 w-5" />}
              />
              <StatCard
                title="Chiffre d'affaires"
                value={new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "XOF",
                }).format(stats.summary.totalRevenue)}
                description="Sur les 30 derniers jours"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <StatCard
                title="Produits"
                value={stats.summary.totalProducts}
                description="Produits actifs dans le catalogue"
                icon={<Package className="h-5 w-5" />}
              />
              <StatCard
                title="Alertes stock"
                value={stats.summary.totalLowStock}
                description="Produits nécessitant une réapprovisionnement"
                icon={<AlertTriangle className="h-5 w-5" />}
              />
            </div>

            {/* Recent Sales & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSalesTable
                sales={stats.recentSales.map((sale) => ({
                  ...sale,
                  createdAt: new Date(sale.createdAt),
                }))}
              />
              <TopProductsTable products={stats.topProducts} />
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/products")}
              >
                <Package className="h-6 w-6 mb-2" />
                Gérer les produits
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/team")}
              >
                <Users className="h-6 w-6 mb-2" />
                Ajouter un membre
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push("/admin/reports")}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                Voir les rapports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
