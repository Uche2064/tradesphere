"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/stores/authStore";

interface DashboardStats {
  summary: {
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    totalLowStock: number;
  };
  recentSales: Array<{
    id: string;
    saleNumber: string;
    total: number;
    createdAt: string;
    store?: { name: string };
    user?: { fullName: string };
  }>;
  topProducts: Array<{
    product: {
      id: string;
      name: string;
      sku: string;
      image?: string | null;
      sellingPrice: number;
    } | null;
    quantity: number;
    revenue: number;
  }>;
  revenueByDay?: Array<{
    date: string;
    revenue: number;
  }>;
  revenueByCompany?: Array<{
    companyName: string;
    revenue: number;
  }>;
  salesByDay?: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

export function useDashboardStats(period: string = "30", storeId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ period });
        if (storeId) {
          params.append("storeId", storeId);
        }

        const response = await apiClient.get(`/api/statistics/dashboard?${params.toString()}`);

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError("Erreur lors du chargement des statistiques");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du chargement des statistiques"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [period, storeId, isAuthenticated]);

  return { stats, isLoading, error };
}
