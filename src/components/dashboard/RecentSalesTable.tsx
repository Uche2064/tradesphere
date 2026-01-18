"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Sale {
  id: string;
  saleNumber: string;
  total: number;
  createdAt: Date;
  store?: {
    name: string;
  };
  user?: {
    fullName: string;
  };
}

interface RecentSalesTableProps {
  sales: Sale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  N°
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  Magasin
                </th>
                <th className="text-left py-2 px-4 text-sm font-medium text-muted-foreground">
                  Vendeur
                </th>
                <th className="text-right py-2 px-4 text-sm font-medium text-muted-foreground">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucune vente récente
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 text-sm font-medium">{sale.saleNumber}</td>
                    <td className="py-2 px-4 text-sm text-muted-foreground">
                      {formatDate(new Date(sale.createdAt))}
                    </td>
                    <td className="py-2 px-4 text-sm">{sale.store?.name || "—"}</td>
                    <td className="py-2 px-4 text-sm">{sale.user?.fullName || "—"}</td>
                    <td className="py-2 px-4 text-sm text-right font-medium">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(sale.total)}
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
