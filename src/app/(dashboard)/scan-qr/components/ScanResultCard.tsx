import Link from "next/link";
import { CheckCircle2, RefreshCw, Sparkles, MapPin, Clock, User, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import { formatRupiah } from "@/lib/format";
import { Order } from "@/lib/types";

const PICKUP_LOCATION = "Jl. Jend. Basuki Rahmat No. 45, Kayutangan Heritage, Malang";

function formatDateID(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ScanResultCardProps {
  order: Order;
  onConfirm: () => void;
  loading: boolean;
  onCancel: () => void;
}

export function ScanResultCard({ order, onConfirm, loading, onCancel }: ScanResultCardProps) {
  const firstItem = order.items?.[0];
  const remainingCount = (order.items?.length || 0) - 1;

  return (
    <Card className="mt-6 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
            <Package className="h-4 w-4" />
          </span>
          Hasil Scan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold text-foreground">
              {order.orderNumber}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {order.user?.name ?? "Pelanggan"}
            </div>
            <p className="mt-1 text-sm font-medium text-foreground">
              {firstItem?.product?.name || "Produk"}
              {remainingCount > 0 ? ` (+${remainingCount} item lainnya)` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Varian: {(firstItem?.variant?.combination || []).join(" / ") || "Default"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDateID(order.pickupDate)} · {order.pickupSlot}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {PICKUP_LOCATION}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <p className="font-display text-base font-bold text-foreground">
              {formatRupiah(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="h-5 w-5" />
            {loading ? "Menyelesaikan…" : "Konfirmasi Ambil"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ScanConfirmedCardProps {
  order: Order;
  onScanAgain: () => void;
}

export function ScanConfirmedCard({ order, onScanAgain }: ScanConfirmedCardProps) {
  const firstItem = order.items?.[0];

  return (
    <Card className="border-accent/40">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <div>
          <p className="font-display text-xl font-bold text-foreground">
            Pesanan selesai. Barang telah diserahkan!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesanan{" "}
            <span className="font-semibold text-foreground">
              {order.orderNumber}
            </span>{" "}
            — {order.user?.name ?? "Pelanggan"} telah mengambil barang.
          </p>
        </div>
        {firstItem?.product?.name && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Status order diperbarui menjadi Selesai
          </span>
        )}
        <div className="mt-3 flex gap-2">
          <Button
            onClick={onScanAgain}
            variant="outline"
            className="h-10 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Scan Pesanan Lain
          </Button>
          <Button asChild className="h-10">
            <Link href="/pesanan">Lihat Daftar Pesanan</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
