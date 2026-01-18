"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";

interface TopProduct {
  product: {
    id: string;
    name: string;
    sku: string;
    image?: string | null;
    sellingPrice: number;
  } | null;
  quantity: number;
  revenue: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Produits les plus vendus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  Produit
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  SKU
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Quantité
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Revenu
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun produit vendu
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
                  <tr key={item.product?.id || index} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 text-sm font-medium">
                      {item.product?.name || "Produit supprimé"}
                    </td>
                    <td className="py-2 px-4 text-sm text-muted-foreground">
                      {item.product?.sku || "—"}
                    </td>
                    <td className="py-2 px-4 text-sm text-right">{item.quantity}</td>
                    <td className="py-2 px-4 text-sm text-right font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(item.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
