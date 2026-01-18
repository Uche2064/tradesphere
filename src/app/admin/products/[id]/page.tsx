"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Spinner } from "@/lib/components/ui/spinner";
import { ArrowLeft, Package, Store, TrendingUp, ShoppingCart, Edit } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/lib/components/ui/badge";

interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  description?: string;
  image?: string;
  purchasePrice: number;
  sellingPrice: number;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
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
    store: {
      id: string;
      name: string;
      slug: string;
      address?: string;
      phone?: string;
      email?: string;
    };
  }>;
  _count: {
    saleItems: number;
    stockMovements: number;
  };
}

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${productId}`);

        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setError("Produit non trouvé");
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement du produit:", err);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error || "Produit non trouvé"}</p>
        <Button onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  const totalQuantity = product.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  const profitMargin = Number(product.sellingPrice) - Number(product.purchasePrice);
  const profitMarginPercent = ((profitMargin / Number(product.purchasePrice)) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/products")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              {product.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              SKU: <span className="font-mono">{product.sku}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge
            variant={product.isActive ? "default" : "secondary"}
            className="text-lg px-4 py-2"
          >
            {product.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {product.image && (
            <Card>
              <CardContent className="pt-6">
                <div className="relative w-full h-96 rounded-lg overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {product.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Magasins et stocks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Magasins et Stocks ({product.stocks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.stocks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aucun stock disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {product.stocks.map((stock) => (
                    <div
                      key={stock.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{stock.store.name}</h4>
                          {stock.store.address && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {stock.store.address}
                            </p>
                          )}
                          {(stock.store.phone || stock.store.email) && (
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                              {stock.store.phone && <span>📞 {stock.store.phone}</span>}
                              {stock.store.email && <span>✉️ {stock.store.email}</span>}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {stock.quantity} unités
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Min: {stock.minQuantity}
                            {stock.maxQuantity && ` / Max: ${stock.maxQuantity}`}
                          </div>
                          {stock.quantity <= stock.minQuantity && (
                            <Badge variant="destructive" className="mt-2">
                              Stock faible
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale - Informations */}
        <div className="space-y-6">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stock total</span>
                <span className="text-2xl font-bold">{totalQuantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ventes totales</span>
                <span className="text-xl font-semibold">{product._count.saleItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mouvements de stock</span>
                <span className="text-xl font-semibold">{product._count.stockMovements}</span>
              </div>
            </CardContent>
          </Card>

          {/* Prix et marge */}
          <Card>
            <CardHeader>
              <CardTitle>Prix et Marge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Prix d'achat</span>
                <p className="text-xl font-semibold">
                  {Number(product.purchasePrice).toFixed(2)} FCFA
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Prix de vente</span>
                <p className="text-xl font-semibold text-green-600">
                  {Number(product.sellingPrice).toFixed(2)} FCFA
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Taux de TVA</span>
                <p className="text-lg font-semibold">{Number(product.taxRate).toFixed(2)}%</p>
              </div>
              <div className="pt-2 border-t">
                <span className="text-sm text-muted-foreground">Marge bénéficiaire</span>
                <p className="text-xl font-semibold text-green-600">
                  {profitMargin.toFixed(2)} FCFA ({profitMarginPercent}%)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.category && (
                <div>
                  <span className="text-sm text-muted-foreground">Catégorie</span>
                  <p className="font-medium">{product.category.name}</p>
                </div>
              )}
              <div>
                <span className="text-sm text-muted-foreground">Entreprise</span>
                <p className="font-medium">{product.company.companyName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Créé le</span>
                <p className="font-medium">
                  {new Date(product.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Modifié le</span>
                <p className="font-medium">
                  {new Date(product.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
