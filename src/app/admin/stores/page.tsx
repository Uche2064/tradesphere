"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { Store, Plus, Search } from "lucide-react";
import { Input } from "@/lib/components/ui/input";

interface StoreWithCount {
  id: string;
  name: string;
  slug: string;
  address?: string;
  _count?: {
    users?: number;
    products?: number;
    sales?: number;
  };
}

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<StoreWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await apiClient.get("/api/stores");

        if (response.data.success) {
          setStores(response.data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des magasins:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            Magasins
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les magasins de votre entreprise
          </p>
        </div>
        <Button onClick={() => router.push("/admin/stores/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau magasin
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un magasin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des magasins */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des magasins ({filteredStores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStores.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun magasin trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/admin/stores/${store.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{store.slug}</p>
                    {store.address && (
                      <p className="text-sm text-muted-foreground mt-1">{store.address}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-muted-foreground">
                        {store._count?.users || 0} utilisateurs
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {store._count?.products || 0} produits
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {store._count?.sales || 0} ventes
                      </span>
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
