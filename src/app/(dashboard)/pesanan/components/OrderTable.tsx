import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import { formatRupiah } from "@/lib/format";
import { Order } from "@/lib/types";

function formatDateID(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
    <>
      {/* Desktop / tablet table */}
      <Card className="hidden overflow-hidden py-0 lg:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                No. Pesanan
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Pembeli
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Produk
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Jadwal Pickup
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Bayar
              </TableHead>
              <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                Total
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => {
              const firstItem = o.items?.[0];
              const remainingCount = (o.items?.length || 0) - 1;
              const sellerName = firstItem?.product?.artisan?.brandName;
              const isOfficial = firstItem?.product?.artisan?.isOfficial;
              const needsRefund = o.refundStatus === "menunggu" || ((o.status === "kedaluwarsa" || o.status === "dibatalkan") && o.payment?.status === "settlement");

              return (
                <TableRow key={o.id} className="hover:bg-muted/30">
                  <TableCell className="px-4 py-3">
                    <span className="font-display text-sm font-bold text-foreground">
                      {o.orderNumber}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-foreground">
                    {o.user?.name ?? "Pelanggan"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-foreground font-medium">
                        {firstItem?.product?.name || "Produk"}
                        {remainingCount > 0 ? ` (+${remainingCount} lainnya)` : ""}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>{(firstItem?.variant?.combination || []).join(" / ") || "Default"}</span>
                        {sellerName && (
                          <>
                            <span>·</span>
                            <span className="font-medium text-foreground">{sellerName}</span>
                            {isOfficial && (
                              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[9px] px-1 py-0 text-primary">
                                Official
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {formatDateID(o.pickupDate)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      · {o.pickupSlot}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs font-medium uppercase text-foreground">
                        {o.paymentMethod === "cod" ? "Cash/QRIS" : "Midtrans"}
                      </span>
                      {needsRefund && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Perlu Refund
                        </Badge>
                      )}
                      {o.refundStatus === "selesai" && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-accent border-accent/30 bg-accent/10">
                          Refund Selesai
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {formatRupiah(o.totalAmount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-primary hover:bg-primary/10"
                    >
                      <Link href={`/pesanan/${o.id}`}>
                        Detail
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile stacked cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {orders.map((o) => {
          const firstItem = o.items?.[0];
          const remainingCount = (o.items?.length || 0) - 1;
          const sellerName = firstItem?.product?.artisan?.brandName;
          const isOfficial = firstItem?.product?.artisan?.isOfficial;
          const needsRefund = o.refundStatus === "menunggu" || ((o.status === "kedaluwarsa" || o.status === "dibatalkan") && o.payment?.status === "settlement");

          return (
            <Card key={o.id} className="gap-3 py-4">
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-foreground">
                      {o.orderNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.user?.name ?? "Pelanggan"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <OrderStatusBadge status={o.status} />
                    {needsRefund && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[9px] gap-1">
                        <AlertCircle className="h-2.5 w-2.5" />
                        Perlu Refund
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Produk
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {firstItem?.product?.name || "Produk"}
                      {remainingCount > 0 ? ` (+${remainingCount})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(firstItem?.variant?.combination || []).join(" / ") || "Varian default"}
                    </p>
                    {sellerName && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span>{sellerName}</span>
                        {isOfficial && (
                          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[9px] px-1 py-0 text-primary">
                            Official
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Pickup
                    </p>
                    <p className="text-sm text-foreground">
                      {formatDateID(o.pickupDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {o.pickupSlot} · {o.paymentMethod === "cod" ? "Cash/QRIS" : "Midtrans"}
                    </p>
                    {o.refundStatus === "selesai" && (
                      <p className="mt-1 text-[11px] font-semibold text-accent">
                        Refund Selesai
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Total
                    </p>
                    <p className="font-display text-base font-bold text-foreground">
                      {formatRupiah(o.totalAmount)}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="h-9 gap-1"
                  >
                    <Link href={`/pesanan/${o.id}`}>
                      Detail
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
