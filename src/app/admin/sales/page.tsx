"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Spinner } from "@/lib/components/ui/spinner";
import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Sale {
  id: string;
  saleNumber: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  store: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  items: Array<{
    quantity: number;
    total: number;
    product: {
      name: string;
      sku: string;
    };
  }>;
}

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await apiClient.get("/api/sales?limit=100");

        if (response.data.success) {
          setSales(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des ventes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      sale.saleNumber.toLowerCase().includes(searchLower) ||
      sale.user.fullName.toLowerCase().includes(searchLower) ||
      sale.user.email.toLowerCase().includes(searchLower) ||
      sale.store.name.toLowerCase().includes(searchLower) ||
      sale.items.some(
        (item) =>
          item.product.name.toLowerCase().includes(searchLower) ||
          item.product.sku.toLowerCase().includes(searchLower)
      )
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Ventes
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez toutes les ventes de votre entreprise
        </p>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une vente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ventes ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune vente trouvée
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/sales/${sale.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-lg font-semibold">
                          {Number(sale.total).toFixed(2)} FCFA
                        </span>
                        <span className="text-sm font-mono text-muted-foreground">
                          {sale.saleNumber}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {sale.paymentMethod}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Par {sale.user.fullName} - {sale.store.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(sale.createdAt), "dd MMM yyyy à HH:mm", { locale: fr })}
                      </p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {sale.items.length} article(s)
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
