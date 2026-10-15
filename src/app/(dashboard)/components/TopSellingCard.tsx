import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

export interface TopSellingProductItem {
  id: number | string;
  name: string;
  soldCount?: number;
  totalSold?: number;
  totalRevenue: number;
}

interface TopSellingCardProps {
  topSellingProducts?: TopSellingProductItem[];
}

export function TopSellingCard({ topSellingProducts = [] }: TopSellingCardProps) {
  const topSellingList = topSellingProducts.map((p, idx) => ({
    rank: idx + 1,
    id: p.id,
    name: p.name,
    soldCount: p.soldCount ?? p.totalSold ?? 0,
    totalRevenue: p.totalRevenue ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <Trophy className="h-4 w-4 text-primary" />
          Produk Terlaris
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Top 5 produk berdasarkan jumlah terjual.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {topSellingList.length === 0 ? (
          <p className="p-6 text-center text-xs text-muted-foreground">Belum ada data produk terlaris</p>
        ) : (
          <ul className="divide-y divide-border">
            {topSellingList.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                    (p.rank === 1
                      ? "bg-[#C99A2E]/20 text-[#8A6A1A]"
                      : p.rank === 2
                        ? "bg-muted-foreground/15 text-muted-foreground"
                        : p.rank === 3
                          ? "bg-[#8A6A3A]/15 text-[#8A6A3A]"
                          : "bg-muted text-muted-foreground")
                  }
                >
                  {p.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRupiah(p.totalRevenue)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-primary">
                  {p.soldCount}× terjual
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
