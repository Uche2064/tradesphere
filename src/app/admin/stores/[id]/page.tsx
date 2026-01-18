"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { ArrowLeft, Store, Package, Users, ShoppingCart, TrendingUp, Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/lib/components/ui/badge";

interface StoreDetail {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    companyName: string;
    slug: string;
  };
  stocks: Array<{
    id: string;
    quantity: number;
    minQuantity: number;
    maxQuantity?: number;
    product: {
      id: string;
      name: string;
      sku: string;
      image?: string;
      sellingPrice: number;
      isActive: boolean;
      category?: {
        id: string;
        name: string;
      };
    };
  }>;
  _count: {
    users: number;
    stocks: number;
    sales: number;
    stockMovements: number;
  };
}

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.id as string;

  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      if (!storeId) return;

      try {
        setLoading(true);
        const response = await apiClient.get(`/api/stores/${storeId}`);

        if (response.data.success) {
          setStore(response.data.data);
        } else {
          setError("Magasin non trouvé");
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement du magasin:", err);
        setError("Erreur lors du chargement du magasin");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Magasin non trouvé"}</p>
        <Button onClick={() => router.push("/admin/stores")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  const totalQuantity = store.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const lowStockProducts = store.stocks.filter(
    (stock) => stock.quantity <= stock.minQuantity
  ).length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/stores")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8" />
              {store.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Slug: <span className="font-mono">{store.slug}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations du magasin */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du magasin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{store.address}</p>
                  </div>
                </div>
              )}
              {store.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{store.phone}</p>
                  </div>
                </div>
              )}
              {store.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{store.email}</p>
                  </div>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Entreprise</p>
                <p className="font-medium">{store.company.companyName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Produits du magasin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits ({store.stocks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {store.stocks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun produit dans ce magasin
                </p>
              ) : (
                <div className="space-y-4">
                  {store.stocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/products/${stock.product.id}`)}
                    >
                      <div className="flex items-start gap-4">
                        {stock.product.image && (
                          <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={stock.product.image}
                              alt={stock.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{stock.product.name}</h4>
                              <p className="text-sm text-muted-foreground font-mono mt-1">
                                SKU: {stock.product.sku}
                              </p>
                              {stock.product.category && (
                                <Badge variant="outline" className="mt-2">
                                  {stock.product.category.name}
                                </Badge>
                              )}
                              {!stock.product.isActive && (
                                <Badge variant="secondary" className="mt-2 ml-2">
                                  Inactif
                                </Badge>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-2xl font-bold">
                                {stock.quantity}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                unités
                              </div>
                              {stock.quantity <= stock.minQuantity && (
                                <Badge variant="destructive" className="mt-2">
                                  Stock faible
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Min: <strong>{stock.minQuantity}</strong>
                            </span>
                            {stock.maxQuantity && (
                              <span>
                                Max: <strong>{stock.maxQuantity}</strong>
                              </span>
                            )}
                            <span className="ml-auto">
                              Prix: <strong>{Number(stock.product.sellingPrice).toFixed(2)} FCFA</strong>
                            </span>
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

        {/* Colonne latérale - Statistiques */}
        <div className="space-y-6">
          {/* Statistiques générales */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Produits</span>
                </div>
                <span className="text-2xl font-bold">{store.stocks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Stock total</span>
                </div>
                <span className="text-2xl font-bold">{totalQuantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Utilisateurs</span>
                </div>
                <span className="text-xl font-semibold">{store._count.users}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ventes</span>
                </div>
                <span className="text-xl font-semibold">{store._count.sales}</span>
              </div>
            </CardContent>
          </Card>

          {/* Alertes */}
          {lowStockProducts > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                  Alertes de stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-700 dark:text-yellow-300">
                  <strong>{lowStockProducts}</strong> produit(s) avec stock faible
                </p>
              </CardContent>
            </Card>
          )}

          {/* Informations supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Créé le</span>
                <p className="font-medium">
                  {new Date(store.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <p className="font-medium">
                  {new Date(store.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
