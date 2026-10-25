import Link from "next/link";
import { AlertCircle, ChevronRight, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PendingRefundItem } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

interface PendingRefundsCardProps {
  pendingRefundCount?: number;
  pendingRefunds?: PendingRefundItem[];
}

export function PendingRefundsCard({
  pendingRefundCount = 0,
  pendingRefunds = [],
}: PendingRefundsCardProps) {
  if (pendingRefundCount === 0 && pendingRefunds.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <Wallet className="h-4 w-4" />
            </span>
            Perlu Refund Manual ({pendingRefundCount})
          </CardTitle>
          <CardDescription>
            Pesanan berbayar yang dibatalkan atau menerima late settlement. Perlu transfer manual ke pembeli.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-1 border-amber-500/40 text-xs">
          <Link href="/pesanan">
            Lihat semua pesanan
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {pendingRefunds.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{item.orderNumber}</span>
                    <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-300">
                      {item.cancelReason ? item.cancelReason.replace("_", " ") : "Perlu refund"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5">
                    {item.buyerName} · {formatRupiah(item.totalAmount)}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary">
                <Link href={`/pesanan/${item.id}`}>
                  Proses
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
