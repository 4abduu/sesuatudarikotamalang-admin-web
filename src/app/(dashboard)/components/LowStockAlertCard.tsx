import Link from "next/link";
import { AlertTriangle, PackageOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { products, isLowStock, lowStockVariants } from "@/data/products";

export function LowStockAlertCard() {
  const lowStockProductList = products.filter((p) => isLowStock(p, 6));

  if (lowStockProductList.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <AlertTriangle className="h-4 w-4 text-[#B5502F]" />
          Perlu Restock
        </CardTitle>
        <Link
          href="/produk"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Kelola produk
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lowStockProductList.map((p) => {
            const low = lowStockVariants(p, 6);
            return (
              <Link
                key={p.id}
                href="/produk"
                className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 transition hover:border-primary/40 hover:bg-secondary/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                  <PackageOpen className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {low.map((v) => `${v.options.join(" / ")} (${v.stock})`).join(", ")}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
