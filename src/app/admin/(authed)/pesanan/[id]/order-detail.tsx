"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Package,
  CalendarClock,
  Wallet,
  Save,
  Ban,
  MapPin,
  Clock,
  Hash,
  AlertTriangle,
  Hourglass,
  PlusCircle,
  Info,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/admin-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  orderStatuses,
  type Order,
  type OrderStatus,
} from "@/data/admin/orders";
import { formatRupiah } from "@/lib/format";
import { toast } from "sonner";
import {
  useUserOrders,
  holdExtensionQuotaMin,
  holdExtendedTotal,
  MAX_HOLD_EXTENSION_MINUTES,
  type UserOrder,
} from "@/lib/user-orders";
import { useAdminSettings } from "@/lib/admin-settings";

function formatDateID(iso: string, withWeekday = false) {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeID(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dummyEmail(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim()
    .replace(/\s+/g, ".");
  return `${slug}@example.com`;
}

const DUMMY_PHONE = "+62 812-3456-7890";
const PICKUP_LOCATION =
  "Jl. Jenderal Basuki Rahmat No. 45, Kayutangan Heritage, Malang";

/** Local widening of OrderStatus so the manual Select can include the v3
 *  computed status "Lewat Batas Pengambilan" (admin can flip it back to
 *  "Selesai" when the customer eventually shows up). The static data file
 *  only persists the 4 base statuses — this widened value is UI-only. */
type AdminOrderStatus = OrderStatus | "Lewat Batas Pengambilan";

const ADMIN_STATUS_OPTIONS: AdminOrderStatus[] = [
  ...orderStatuses,
  "Lewat Batas Pengambilan",
];

const HOLD_EXTENSION_CHOICES = [15, 30, 60] as const;

/** Render an order-status badge that also knows the v3 "Lewat Batas
 *  Pengambilan" computed status (moss-on-cream). Falls through to the
 *  shared OrderStatusBadge for the 4 base statuses. */
function AdminStatusBadge({ status }: { status: AdminOrderStatus }) {
  if (status === "Lewat Batas Pengambilan") {
    return (
      <span className="inline-flex items-center rounded-full bg-[#6B7A3D]/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
        Lewat Batas Pengambilan
      </span>
    );
  }
  return <OrderStatusBadge status={status} />;
}

export function OrderDetail({ order }: { order: Order }) {
  const [status, setStatus] = useState<AdminOrderStatus>(order.status);
  const [draftStatus, setDraftStatus] = useState<AdminOrderStatus>(order.status);

  // For the "Perpanjang Waktu Hold" card — read the LIVE order from the
  // persisted user-orders store so extensions update the UI reactively.
  // Static seed orders (o1..o8) are NOT in the store → liveOrder is undefined
  // and the card treats the order as a "demo" (no-op + toast on extend).
  const liveOrder = useUserOrders((s) =>
    s.orders.find((o) => o.id === order.id),
  );
  const settings = useAdminSettings((s) => s.settings);

  const saveStatus = () => {
    if (draftStatus === status) return;
    setStatus(draftStatus);
    toast.success("Status pesanan diperbarui", {
      description: `${order.orderNumber} → ${draftStatus}`,
    });
  };

  const cancelOrder = () => {
    setStatus("Dibatalkan");
    setDraftStatus("Dibatalkan");
    toast.success("Pesanan dibatalkan", {
      description: `${order.orderNumber} telah dibatalkan.`,
    });
  };

  /* -------- Perpanjang Waktu Hold helpers -------- */

  // Build a "view order" — prefer the live store order, else synthesize a
  // pseudo-order (with default hold fields) so the static seed orders still
  // show *some* hold info on the card.
  const initialHoldMs = settings.holdDurationMinutes * 60_000;
  const viewOrder: UserOrder = liveOrder ?? {
    ...order,
    userId: "",
    variantLabel: order.variantName,
    status: order.status,
    // Synthesize hold fields from settings + createdAt for demo display.
    holdExpiresAt:
      order.paymentMethod === "Cash/QRIS"
        ? new Date(new Date(order.createdAt).getTime() + initialHoldMs).toISOString()
        : undefined,
    holdExtendedMinutes: 0,
  };

  const showExtendHoldCard =
    order.paymentMethod === "Cash/QRIS" && order.status === "Menunggu Bayar";

  const extendedTotal = holdExtendedTotal(viewOrder);
  const remainingQuota = holdExtensionQuotaMin(viewOrder);
  const quotaExhausted = remainingQuota <= 0;
  const isDemoOrder = !liveOrder;

  const handleExtend = (minutes: number) => {
    if (quotaExhausted) {
      toast.error("Kuota perpanjangan habis", {
        description: `Total perpanjangan sudah mencapai batas ${MAX_HOLD_EXTENSION_MINUTES} menit (2 hari).`,
      });
      return;
    }
    // Static seed orders aren't in the user-orders store → can't persist.
    if (isDemoOrder) {
      toast.info("Pesanan demo — perpanjangan tidak tersimpan", {
        description: `${order.orderNumber} adalah pesanan contoh statis. Perpanjangan hold hanya tersimpan untuk pesanan nyata dari pembeli.`,
      });
      return;
    }
    const result = useUserOrders.getState().extendHold(order.id, minutes);
    if (result) {
      toast.success(`Hold diperpanjang ${minutes} menit`, {
        description: `Hold berakhir pada ${formatDateTimeID(result)} WIB.`,
      });
    } else {
      toast.error("Gagal memperpanjang hold", {
        description:
          "Kuota perpanjangan tidak mencukupi (cap 2 hari sejak pesanan dibuat).",
      });
    }
  };

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/pesanan"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua pesanan
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground md:text-[28px]">
            {order.orderNumber}
          </h1>
          <AdminStatusBadge status={status} />
        </div>
        <p className="text-xs text-muted-foreground">
          Dibuat:{" "}
          <span className="font-medium text-foreground">
            {formatDateTimeID(order.createdAt)}
          </span>{" "}
          WIB
        </p>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Info Pembeli */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </span>
              Info Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Nama</p>
              <p className="font-medium text-foreground">{order.buyerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">No. HP (dummy)</p>
              <p className="font-medium text-foreground">{DUMMY_PHONE}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email (dummy)</p>
              <p className="break-all font-medium text-foreground">
                {dummyEmail(order.buyerName)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Produk */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                <Package className="h-4 w-4" />
              </span>
              Info Produk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Produk</p>
              <p className="font-medium text-foreground">{order.productName}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Varian</p>
                <p className="font-medium text-foreground">{order.variantName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Jumlah</p>
                <p className="font-medium text-foreground">1</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total harga</span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatRupiah(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Jadwal Pickup */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C99A2E]/15 text-[#8a6a1a]">
                <CalendarClock className="h-4 w-4" />
              </span>
              Jadwal Pickup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {formatDateID(order.pickupDate, true)}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium text-foreground">
                {order.pickupSlot}
              </span>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Lokasi Pickup
                </p>
                <p className="text-xs text-muted-foreground">{PICKUP_LOCATION}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pembayaran */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#8A6A3A]/15 text-[#8A6A3A]">
                <Wallet className="h-4 w-4" />
              </span>
              Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Metode</span>
              <span className="font-medium text-foreground">
                {order.paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <AdminStatusBadge status={status} />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatRupiah(order.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Perpanjang Waktu Hold — Cash/QRIS + Menunggu Bayar only */}
      {showExtendHoldCard && (
        <Card className="mt-4 border-[#C99A2E]/30 bg-[#FAF1DC]/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C99A2E]/15 text-[#8a6a1a]">
                <Hourglass className="h-4 w-4" />
              </span>
              Perpanjang Waktu Hold
            </CardTitle>
            <CardDescription>
              Tambah waktu penahanan stok untuk pesanan{" "}
              <span className="font-medium text-foreground">Cash/QRIS</span> yang
              belum dibayar. Cap total 2 hari (2880 menit) sejak pesanan dibuat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo notice for static seed orders */}
            {isDemoOrder && (
              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Pesanan contoh statis — perpanjangan tidak akan tersimpan ke
                  store. Untuk pesanan nyata dari pembeli, perubahan hold
                  langsung tersimpan &amp; reaktif di UI.
                </span>
              </div>
            )}

            {/* Current hold status */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Hold berakhir</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {viewOrder.holdExpiresAt
                    ? formatDateTimeID(viewOrder.holdExpiresAt)
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Total diperpanjang</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {extendedTotal} menit
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Sisa kuota</p>
                <p
                  className={
                    quotaExhausted
                      ? "mt-0.5 font-medium text-destructive"
                      : "mt-0.5 font-medium text-accent"
                  }
                >
                  {Math.max(0, Math.round(remainingQuota))} menit
                </p>
              </div>
            </div>

            {/* Progress bar showing quota usage */}
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#C99A2E] transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((MAX_HOLD_EXTENSION_MINUTES - remainingQuota) /
                          MAX_HOLD_EXTENSION_MINUTES) *
                          100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {Math.round(remainingQuota) <= 0
                  ? "Kuota perpanjangan habis"
                  : `Terpakai ${Math.round(
                      (MAX_HOLD_EXTENSION_MINUTES - remainingQuota) /
                        MAX_HOLD_EXTENSION_MINUTES *
                        100,
                    )}% dari batas 2 hari sejak pesanan dibuat.`}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Tambah waktu:
              </span>
              <div className="flex flex-wrap gap-2">
                {HOLD_EXTENSION_CHOICES.map((minutes) => {
                  const wouldExceed = minutes > remainingQuota;
                  return (
                    <Button
                      key={minutes}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={quotaExhausted || wouldExceed}
                      onClick={() => handleExtend(minutes)}
                      className="gap-1.5"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      {minutes} menit
                    </Button>
                  );
                })}
              </div>
              {quotaExhausted && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Kuota perpanjangan habis
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ubah Status Manual */}
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Hash className="h-4 w-4" />
            </span>
            Ubah Status Manual
          </CardTitle>
          <CardDescription>
            Termasuk opsi{" "}
            <span className="font-medium text-foreground">
              Lewat Batas Pengambilan → Selesai
            </span>{" "}
            jika pelanggan akhirnya datang mengambil barang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-64">
              <label
                htmlFor="status-select"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Pilih status
              </label>
              <Select
                value={draftStatus}
                onValueChange={(v) => setDraftStatus(v as AdminOrderStatus)}
              >
                <SelectTrigger id="status-select" className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={saveStatus}
              disabled={draftStatus === status}
              className="h-9 gap-2 sm:mb-0"
            >
              <Save className="h-4 w-4" />
              Simpan Status
            </Button>
            <p className="text-xs text-muted-foreground sm:ml-2">
              Status saat ini:{" "}
              <span className="font-medium text-foreground">{status}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="h-10 gap-2"
              disabled={status === "Dibatalkan"}
            >
              <Ban className="h-4 w-4" />
              Batalkan Pesanan
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 font-display">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Batalkan pesanan {order.orderNumber}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan mengubah status pesanan menjadi{" "}
                <strong className="text-foreground">Dibatalkan</strong>. Pembeli
                akan menerima notifikasi pembatalan. Aksi ini bersifat dummy pada
                mode demo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={cancelOrder}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Ya, Batalkan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
