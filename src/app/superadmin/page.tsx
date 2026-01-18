"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { StatCard } from "@/components/dashboard/StatCard";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePageTitle } from "@/hooks/usePageTitle";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { ShoppingBag, DollarSign, Package, AlertTriangle } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RevenueByCompanyChart } from "@/components/dashboard/RevenueByCompanyChart";
import { SubscriptionStatus } from "@/lib/constants/roles";

interface CompanyWithCount {
  id: string;
  companyName: string;
  slug: string;
  subscriptionStatus: SubscriptionStatus;
  _count?: {
    users?: number;
    stores?: number;
    products?: number;
    sales?: number;
  };
}

export default function SuperAdminDashboard() {
  usePageTitle("Tableau de bord SuperAdmin");
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [companies, setCompanies] = useState<CompanyWithCount[]>([]);
  const { stats } = useDashboardStats("30");

  useEffect(() => {
    const fetchCompanies = async () => {
      if (!accessToken) return;

      try {
        const response = await apiClient.get("/api/companies");

        if (response.data.success) {
          setCompanies(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des entreprises:", error);
      }
    };

    if (accessToken) {
      fetchCompanies();
    }
  }, [accessToken]);

  const totalCompanies = companies.length;
  const totalUsers = companies.reduce((sum, c) => sum + (c._count?.users || 0), 0);
  const totalStores = companies.reduce((sum, c) => sum + (c._count?.stores || 0), 0);
  const totalProducts = companies.reduce((sum, c) => sum + (c._count?.products || 0), 0);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord SuperAdmin</h1>
            <p className="text-muted-foreground mt-1">
              Vue d&apos;ensemble de toutes les entreprises
            </p>
          </div>
          <Button onClick={() => router.push("/superadmin/companies")}>
            Gérer les entreprises
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Entreprises"
            value={totalCompanies}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <StatCard
            title="Utilisateurs total"
            value={totalUsers}
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            title="Magasins total"
            value={totalStores}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <StatCard
            title="Produits total"
            value={totalProducts}
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Global Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Ventes totales"
              value={stats.summary.totalSales}
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <StatCard
              title="Revenus totaux"
              value={new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(stats.summary.totalRevenue)}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              title="Produits actifs"
              value={stats.summary.totalProducts}
              icon={<Package className="h-5 w-5" />}
            />
            <StatCard
              title="Stock faible"
              value={stats.summary.totalLowStock}
              icon={<AlertTriangle className="h-5 w-5" />}
              description="Produits nécessitant une réapprovisionnement"
            />
          </div>
        )}

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>Entreprises actives</CardTitle>
          </CardHeader>
          <CardContent>
            {companies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucune entreprise enregistrée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                        Nom
                      </th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                        Slug
                      </th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                        Statut
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                        Utilisateurs
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                        Magasins
                      </th>
                      <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                        Produits
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => router.push(`/superadmin/companies/${company.id}`)}
                      >
                        <td className="py-2 px-4 text-sm font-medium">{company.companyName}</td>
                        <td className="py-2 px-4 text-sm text-muted-foreground">{company.slug}</td>
                        <td className="py-2 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              company.subscriptionStatus === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : company.subscriptionStatus === "TRIAL"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {company.subscriptionStatus}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {company._count?.users || 0}
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {company._count?.stores || 0}
                        </td>
                        <td className="py-2 px-4 text-sm text-right">
                          {company._count?.products || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphiques de revenus */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.revenueByDay && stats.revenueByDay.length > 0 && (
              <RevenueChart data={stats.revenueByDay} period="30" />
            )}
            {stats.revenueByCompany && stats.revenueByCompany.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenus par entreprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueByCompanyChart data={stats.revenueByCompany} />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
