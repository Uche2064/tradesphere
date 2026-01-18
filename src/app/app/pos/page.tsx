"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { usePageTitle } from "@/hooks/usePageTitle";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Badge } from "@/lib/components/ui/badge";
import { Spinner } from "@/lib/components/ui/spinner";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Receipt,
  X,
} from "lucide-react";
import Image from "next/image";

interface ProductWithStock {
  id: string;
  name: string;
  sku: string;
  image?: string;
  sellingPrice: number;
  taxRate: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  stocks: Array<{
    id: string;
    quantity: number;
    minQuantity: number;
    store: {
      id: string;
      name: string;
    };
  }>;
}

interface ApiProduct {
  id: string;
  name: string;
  sku: string;
  image?: string;
  sellingPrice: number | string;
  taxRate: number | string;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  stocks: Array<{
    id: string;
    quantity: number;
    minQuantity: number;
    store: {
      id: string;
      name: string;
    };
  }>;
}

interface CartItem {
  productId: string;
  product: ProductWithStock;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  stockQuantity: number;
}

type PaymentMethod = "CASH" | "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE";

export default function POSPage() {
  usePageTitle("Point de Vente");
  const { user, accessToken } = useAuthStore();
  const { isConnected, on, off } = useWebSocket();
  
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [processingSale, setProcessingSale] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);

  // Récupérer les produits avec leur stock
  useEffect(() => {
    if (!accessToken || !user?.store?.id) return;

    const fetchProducts = async () => {
      try {
        const response = await apiClient.get<{
          success: boolean;
          data: ApiProduct[];
        }>("/api/products?limit=1000");
        if (response.data.success && user?.store?.id) {
          // Filtrer les produits qui ont du stock dans le magasin actuel
          const storeId = user.store.id;
          const productsWithStock: ProductWithStock[] = response.data.data
            .map((product: ApiProduct) => ({
              ...product,
              sellingPrice: Number(product.sellingPrice),
              taxRate: Number(product.taxRate),
              stocks: product.stocks.filter(
                (stock) => stock.store.id === storeId
              ),
            }))
            .filter((product) => product.stocks.length > 0 && product.isActive);
          
          setProducts(productsWithStock);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        toast.error("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [accessToken, user?.store?.id]);

  // Écouter les mises à jour de stock en temps réel
  useEffect(() => {
    if (!isConnected || !user?.store?.id) return;

    const currentStoreId = user.store.id;

    const handleStockUpdate = (data: {
      type: "STOCK_UPDATE";
      payload: {
        productId: string;
        oldQuantity: number;
        newQuantity: number;
        reason: string;
      };
      timestamp: Date;
      companyId: string;
      storeId: string;
    }) => {
      // Ne traiter que les mises à jour pour le magasin actuel
      if (data.storeId !== currentStoreId) return;

      // Mettre à jour le stock du produit dans la liste
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.id === data.payload.productId) {
            return {
              ...product,
              stocks: product.stocks.map((stock) =>
                stock.store.id === data.storeId
                  ? { ...stock, quantity: data.payload.newQuantity }
                  : stock
              ),
            };
          }
          return product;
        })
      );

      // Mettre à jour le stock dans le panier
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.productId === data.payload.productId) {
            return {
              ...item,
              stockQuantity: data.payload.newQuantity,
            };
          }
          return item;
        })
      );

      toast.info(
        `Stock mis à jour: ${data.payload.newQuantity} unités disponibles`
      );
    };

    on("stock:update", handleStockUpdate);

    return () => {
      off("stock:update", handleStockUpdate);
    };
  }, [isConnected, on, off, user?.store?.id]);

  // Filtrer les produits selon la recherche
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Obtenir le stock disponible pour un produit
  const getProductStock = (product: ProductWithStock): number => {
    const stock = product.stocks.find((s) => s.store.id === user?.store?.id);
    return stock?.quantity || 0;
  };

  // Ajouter un produit au panier
  const addToCart = (product: ProductWithStock) => {
    const stockQuantity = getProductStock(product);
    
    if (stockQuantity === 0) {
      toast.error("Stock épuisé pour ce produit");
      return;
    }

    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity >= stockQuantity) {
        toast.error(`Stock insuffisant. Disponible: ${stockQuantity}`);
        return;
      }
      updateCartItemQuantity(product.id, existingItem.quantity + 1);
    } else {
      const unitPrice = Number(product.sellingPrice);
      const taxRate = Number(product.taxRate);
      const subtotal = unitPrice;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      setCart([
        ...cart,
        {
          productId: product.id,
          product,
          quantity: 1,
          unitPrice,
          taxRate,
          subtotal,
          taxAmount,
          total,
          stockQuantity,
        },
      ]);
      toast.success(`${product.name} ajouté au panier`);
    }
  };

  // Mettre à jour la quantité d'un article dans le panier
  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.productId === productId) {
            if (newQuantity > item.stockQuantity) {
              toast.error(`Stock insuffisant. Disponible: ${item.stockQuantity}`);
              return item;
            }
            if (newQuantity <= 0) {
              return null;
            }
            const subtotal = item.unitPrice * newQuantity;
            const taxAmount = (subtotal * item.taxRate) / 100;
            const total = subtotal + taxAmount;
            return {
              ...item,
              quantity: newQuantity,
              subtotal,
              taxAmount,
              total,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  // Retirer un article du panier
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  // Calculer les totaux
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const taxAmount = cart.reduce((sum, item) => sum + item.taxAmount, 0);
    const total = subtotal + taxAmount - discount;
    return { subtotal, taxAmount, discount, total };
  }, [cart, discount]);

  // Finaliser la vente
  const processSale = async () => {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    setProcessingSale(true);

    try {
      const response = await apiClient.post("/api/sales", {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        discount: discount || 0,
      });

      if (response.data.success) {
        toast.success("Vente effectuée avec succès!");
        setCart([]);
        setShowPaymentModal(false);
        setCustomerName("");
        setCustomerPhone("");
        setDiscount(0);
        setPaymentMethod("CASH");
        
        // Rafraîchir les produits pour mettre à jour les stocks
        const productsResponse = await apiClient.get<{
          success: boolean;
          data: ApiProduct[];
        }>("/api/products?limit=1000");
        if (productsResponse.data.success) {
          const storeId = user?.store?.id;
          if (storeId) {
            const productsWithStock: ProductWithStock[] = productsResponse.data.data
              .map((product: ApiProduct) => ({
                ...product,
                sellingPrice: Number(product.sellingPrice),
                taxRate: Number(product.taxRate),
                stocks: product.stocks.filter(
                  (stock) => stock.store.id === storeId
                ),
              }))
              .filter((product) => product.stocks.length > 0 && product.isActive);
            setProducts(productsWithStock);
          }
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage =
        error.response?.data?.error || "Erreur lors de la finalisation de la vente";
      toast.error(errorMessage);
    } finally {
      setProcessingSale(false);
    }
  };

  if (!user?.store?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucun magasin assigné. Veuillez contacter votre administrateur.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Point de Vente
          </h1>
          <p className="text-muted-foreground mt-1">
            {user.store?.name || "Magasin"} - {isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Liste des produits */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barre de recherche */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit par nom ou SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Liste des produits */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const stockQuantity = getProductStock(product);
                  const isOutOfStock = stockQuantity === 0;
                  
                  return (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isOutOfStock ? "opacity-50" : ""
                      }`}
                      onClick={() => !isOutOfStock && addToCart(product)}
                    >
                      <CardContent className="p-4">
                        {product.image && (
                          <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono mb-2">
                          {product.sku}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">
                            {Number(product.sellingPrice).toFixed(0)} FCFA
                          </span>
                          <Badge
                            variant={isOutOfStock ? "destructive" : "default"}
                            className="text-xs"
                          >
                            Stock: {stockQuantity}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Colonne droite - Panier */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Panier ({cart.length})</span>
                  {cart.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCart([])}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Le panier est vide
                  </p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {cart.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-start gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {item.unitPrice.toFixed(0)} FCFA × {item.quantity}
                            </p>
                            <p className="text-xs font-semibold mt-1">
                              {item.total.toFixed(0)} FCFA
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              disabled={item.quantity >= item.stockQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeFromCart(item.productId)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totaux */}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total:</span>
                        <span>{cartTotals.subtotal.toFixed(0)} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes:</span>
                        <span>{cartTotals.taxAmount.toFixed(0)} FCFA</span>
                      </div>
                      {cartTotals.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Remise:</span>
                          <span>-{cartTotals.discount.toFixed(0)} FCFA</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{cartTotals.total.toFixed(0)} FCFA</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Finaliser la vente
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de paiement */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Finaliser la vente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Méthode de paiement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "CASH", label: "Espèces", icon: Banknote },
                      { value: "CARD", label: "Carte", icon: CreditCard },
                      {
                        value: "MOBILE_MONEY",
                        label: "Mobile Money",
                        icon: Smartphone,
                      },
                      {
                        value: "BANK_TRANSFER",
                        label: "Virement",
                        icon: Building2,
                      },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <Button
                          key={method.value}
                          variant={
                            paymentMethod === method.value ? "default" : "outline"
                          }
                          onClick={() =>
                            setPaymentMethod(method.value as PaymentMethod)
                          }
                          className="h-20 flex-col"
                        >
                          <Icon className="h-5 w-5 mb-1" />
                          {method.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nom du client (optionnel)
                  </label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nom du client"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Téléphone du client (optionnel)
                  </label>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Téléphone"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Remise (FCFA)
                  </label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={processingSale}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={processSale}
                    disabled={processingSale}
                  >
                    {processingSale ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Traitement...
                      </>
                    ) : (
                      "Confirmer"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
