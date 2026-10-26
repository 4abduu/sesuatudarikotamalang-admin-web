"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { OrderStatusBadge } from "@/app/(dashboard)/components/admin-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { apiFetch, ApiError } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { toast } from "sonner";

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Peta transisi status yang diizinkan backend (API_CONTRACT.md §9)
 * ─────────────────────────────────────────────────────────────────────────── */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  menunggu_bayar: ["lunas", "dibatalkan", "kedaluwarsa"],
  lunas: ["selesai", "dibatalkan", "lewat_batas_pengambilan"],
  lewat_batas_pengambilan: ["selesai", "dibatalkan"], // ← TAMBAHAN 2026-10-17
  selesai: [],
  dibatalkan: [],
  kedaluwarsa: [],
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu_bayar: "Menunggu Bayar",
  lunas: "Lunas",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  kedaluwarsa: "Kedaluwarsa",
  lewat_batas_pengambilan: "Lewat Batas Pengambilan",
};

const HOLD_EXTENSION_CHOICES = [15, 30, 60] as const;
const MAX_HOLD_EXTENSION_MINUTES = 2880; // 2 hari

/* ─────────────────────────────────────────────────────────────────────────── *
 *  Helper formatters
 * ─────────────────────────────────────────────────────────────────────────── */
function formatDateID(iso: string, withWeekday = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: withWeekday ? "long" : undefined,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTimeID(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  OrderDetailContent — fetch + render detail pesanan dari API
 * ─────────────────────────────────────────────────────────────────────────── */
export function OrderDetailContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ order: Order }>(`/api/orders/${orderId}`);
      setOrder(res.order);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat detail pesanan dari server");
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="grid min-h-[400px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat detail pesanan…</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">
              Gagal Memuat Pesanan
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error ?? "Pesanan tidak ditemukan"}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchOrder} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Button asChild variant="ghost">
              <Link href="/pesanan">Kembali ke Daftar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <OrderDetail order={order} onOrderUpdate={setOrder} />;
}

/* ─────────────────────────────────────────────────────────────────────────── *
 *  OrderDetail — render + aksi pesanan
 * ─────────────────────────────────────────────────────────────────────────── */
function OrderDetail({
  order: initialOrder,
  onOrderUpdate,
}: {
  order: Order;
  onOrderUpdate: (o: Order) => void;
}) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [draftStatus, setDraftStatus] = useState<OrderStatus>(initialOrder.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [extendingHold, setExtendingHold] = useState<number | null>(null);
  const [cancellingOverdue, setCancellingOverdue] = useState(false);
  const [cancellingWithReason, setCancellingWithReason] = useState(false);
  const [markingRefunded, setMarkingRefunded] = useState(false);

  const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? [];
  const isFinal = allowedNext.length === 0;

  const isLateSettlement =
    (order.status === "kedaluwarsa" || order.status === "dibatalkan") &&
    order.payment?.status === "settlement";

  const showExtendHoldCard =
    order.paymentMethod === "cod" && order.status === "menunggu_bayar";

  const remainingHoldQuota = MAX_HOLD_EXTENSION_MINUTES - (order.holdExtendedMinutes ?? 0);
  const quotaExhausted = remainingHoldQuota <= 0;

  /* ── Muat ulang detail order untuk menyegarkan objek refund ── */
  const reloadOrder = async () => {
    try {
      const res = await apiFetch<{ order: Order }>(`/api/orders/${order.id}`);
      if (res.order) {
        setOrder(res.order);
        onOrderUpdate(res.order);
        setDraftStatus(res.order.status);
      }
    } catch {
      // fallback jika /api/orders/:id gagal, coba /api/admin/orders/:id
      try {
        const resAdmin = await apiFetch<{ order: Order }>(`/api/admin/orders/${order.id}`);
        if (resAdmin.order) {
          setOrder(resAdmin.order);
          onOrderUpdate(resAdmin.order);
          setDraftStatus(resAdmin.order.status);
        }
      } catch {
        // no-op
      }
    }
  };

  /* ── Ubah status manual ── */
  const handleSaveStatus = async () => {
    if (draftStatus === order.status) return;
    setSavingStatus(true);
    try {
      const bodyPayload: { status: OrderStatus; cancelReason?: string } = { status: draftStatus };
      if (draftStatus === "dibatalkan" && order.paymentMethod === "midtrans" && order.payment?.status === "settlement") {
        bodyPayload.cancelReason = "kesalahan_toko";
      }

      const res = await apiFetch<{ message: string; order: Order }>(
        `/api/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(bodyPayload),
        }
      );
      toast.success("Status pesanan diperbarui", {
        description: `${res.order.orderNumber} → ${STATUS_LABEL[res.order.status]}`,
      });
      await reloadOrder();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal memperbarui status";
      toast.error("Gagal mengubah status", { description: msg });
      // kembalikan draft ke status saat ini
      setDraftStatus(order.status);
    } finally {
      setSavingStatus(false);
    }
  };

  /* ── Batalkan pesanan berbayar dengan alasan spesifik ── */
  const handleCancelWithReason = async (reason: "permintaan_pembeli" | "kesalahan_toko") => {
    setCancellingWithReason(true);
    try {
      const res = await apiFetch<{ message: string; order: Order }>(
        `/api/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: "dibatalkan", cancelReason: reason }),
        }
      );
      toast.success("Pesanan berhasil dibatalkan", {
        description: res.message || "Status refund pesanan kini menunggu pengembalian dana manual.",
      });
      await reloadOrder();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "REFUND_WINDOW_PASSED") {
          toast.error("Batas refund permintaan pembeli sudah lewat. Pakai 'kesalahan toko' bila memang kesalahan toko.");
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Gagal membatalkan pesanan");
      }
    } finally {
      setCancellingWithReason(false);
    }
  };

  /* ── Tandai refund manual selesai ── */
  const handleMarkRefunded = async () => {
    setMarkingRefunded(true);
    try {
      const res = await apiFetch<{ message: string; order: Order }>(
        `/api/admin/orders/${order.id}/refunded`,
        {
          method: "PATCH",
        }
      );
      toast.success(res.message || "Refund telah ditandai selesai");
      await reloadOrder();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "REFUND_NOT_PENDING") {
          toast.error("Pesanan ini tidak sedang menunggu refund.");
          await reloadOrder();
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error("Gagal menandai refund selesai");
      }
    } finally {
      setMarkingRefunded(false);
    }
  };

  /* ── Batalkan order lewat_batas_pengambilan (quick-action button) ── */
  const handleCancelOverdue = async () => {
    setCancellingOverdue(true);
    try {
      const bodyPayload: { status: string; cancelReason?: string } = { status: "dibatalkan" };
      if (order.paymentMethod === "midtrans" && (order.refund?.paid || order.payment?.status === "settlement")) {
        bodyPayload.cancelReason = "kesalahan_toko";
      }

      const res = await apiFetch<{ message: string; order: Order }>(
        `/api/admin/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify(bodyPayload),
        }
      );
      toast.success("Pesanan dibatalkan", {
        description: `Stok varian telah dikembalikan secara otomatis.`,
      });
      await reloadOrder();
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal membatalkan pesanan";
      toast.error("Gagal membatalkan", { description: msg });
    } finally {
      setCancellingOverdue(false);
    }
  };

  /* ── Perpanjang hold ── */
  const handleExtendHold = async (minutes: number) => {
    if (quotaExhausted) {
      toast.error("Kuota perpanjangan habis", {
        description: `Total perpanjangan sudah mencapai batas 2 hari (${MAX_HOLD_EXTENSION_MINUTES} menit).`,
      });
      return;
    }
    setExtendingHold(minutes);
    try {
      const res = await apiFetch<{ message: string; order: Order }>(
        `/api/admin/orders/${order.id}/extend-hold`,
        {
          method: "PATCH",
          body: JSON.stringify({ additionalMinutes: minutes }),
        }
      );
      setOrder(res.order);
      onOrderUpdate(res.order);
      toast.success(`Hold diperpanjang ${minutes} menit`, {
        description: `Hold berakhir pada ${formatDateTimeID(res.order.holdExpiresAt ?? "")} WIB.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal memperpanjang hold";
      toast.error("Gagal memperpanjang hold", { description: msg });
    } finally {
      setExtendingHold(null);
    }
  };

  const firstItem = order.items?.[0];
  const remainingCount = (order.items?.length ?? 0) - 1;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/pesanan"
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
          <OrderStatusBadge status={order.status} />
          {isLateSettlement && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertCircle className="h-3 w-3" />
              Sudah dibayar, perlu refund
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Dibuat:{" "}
          <span className="font-medium text-foreground">
            {formatDateTimeID(order.createdAt)}
          </span>{" "}
          WIB
        </p>
      </div>

      {/* ── Banner: Lewat Batas Pengambilan + tombol Batalkan cepat ── */}
      {order.status === "lewat_batas_pengambilan" && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-bold text-foreground">
                Lewat batas pengambilan
              </p>
              <p className="text-xs text-muted-foreground">
                Pembeli sudah melewati batas pengambilan. Batalkan pesanan ini
                untuk mengembalikan stok varian secara otomatis.
              </p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 shrink-0 gap-2"
                disabled={cancellingOverdue}
              >
                {cancellingOverdue ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
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
                  Status akan berubah dari{" "}
                  <strong className="text-foreground">
                    Lewat Batas Pengambilan
                  </strong>{" "}
                  menjadi{" "}
                  <strong className="text-foreground">Dibatalkan</strong>.
                  Stok varian akan dikembalikan secara otomatis oleh backend.
                  Tindakan ini tidak dapat diurungkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelOverdue}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Ya, Batalkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* ── Section: Pembatalan & Pengembalian Dana (untuk pesanan online/Midtrans berbayar) ── */}
      {(order.refund?.paid || (order.paymentMethod === "midtrans" && order.payment?.status === "settlement") || order.refundStatus === "menunggu" || order.refundStatus === "selesai") && (
        <Card className="mb-4 border-primary/20 bg-card">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Wallet className="h-4 w-4" />
                </span>
                Pembatalan & Pengembalian Dana (Refund)
              </CardTitle>
              {order.refundStatus === "menunggu" && (
                <Badge variant="destructive" className="w-fit gap-1 text-xs font-semibold">
                  <AlertCircle className="h-3 w-3" />
                  Menunggu Refund Manual
                </Badge>
              )}
              {order.refundStatus === "selesai" && (
                <Badge variant="secondary" className="w-fit gap-1 border-accent/40 bg-accent/10 text-xs font-semibold text-accent">
                  <CheckCircle2 className="h-3 w-3" />
                  Refund Selesai
                </Badge>
              )}
            </div>
            <CardDescription>
              Pesanan online yang telah dibayar pembeli. Pengembalian dana dilakukan manual oleh admin melalui Midtrans/Transfer bank.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informasi Batas Waktu & Status */}
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:grid-cols-3 text-xs">
              <div>
                <p className="text-muted-foreground">Status Pembayaran</p>
                <p className="font-semibold text-foreground">
                  {order.payment?.paidAt ? `Lunas (${formatDateTimeID(order.payment.paidAt)} WIB)` : "Terbayar Online"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Batas Refund Pembeli</p>
                <p className="font-semibold text-foreground">
                  {order.refund?.eligibleUntil ? `${formatDateTimeID(order.refund.eligibleUntil)} WIB` : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Refund Saat Ini</p>
                <p className="font-semibold text-foreground capitalize">
                  {order.refundStatus ? order.refundStatus.replace("_", " ") : "Tidak Ada"}
                  {order.refundedAt && ` (selesai ${formatDateID(order.refundedAt)})`}
                </p>
              </div>
            </div>

            {/* Pesan State Refund */}
            {order.refund?.state === "dalam_batas_waktu" && (
              <p className="text-xs text-muted-foreground">
                Dapat dibatalkan atas permintaan pembeli sampai{" "}
                <strong className="text-foreground">{formatDateTimeID(order.refund.eligibleUntil || "")} WIB</strong>.
              </p>
            )}
            {order.refund?.state === "lewat_batas_waktu" && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                Batas refund permintaan pembeli sudah lewat. Tombol permintaan pembeli dinonaktifkan.
              </div>
            )}
            {order.refund?.state === "lewat_batas_pengambilan" && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                Pesanan telah melewati batas waktu pengambilan di toko.
              </div>
            )}
            {order.refundStatus === "menunggu" && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive font-medium">
                Pesanan ini sedang menunggu pengembalian dana manual ke pembeli. Silakan kembalikan dana secara manual, lalu tekan tombol &ldquo;Tandai Sudah Refund&rdquo; di bawah.
              </div>
            )}
            {order.refundStatus === "selesai" && (
              <div className="rounded-md border border-accent/30 bg-accent/10 p-3 text-xs text-accent font-medium">
                Refund telah selesai ditandai pada {order.refundedAt ? formatDateTimeID(order.refundedAt) : "sebelumnya"}. Dana telah dikembalikan ke pembeli.
              </div>
            )}

            {/* Aksi Pembatalan & Tandai Refund */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
              {/* Tombol Batal Permintaan Pembeli */}
              {order.status !== "dibatalkan" && order.status !== "selesai" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!(order.refund?.canCancelByBuyerRequest ?? (order.refund?.state === "dalam_batas_waktu")) || cancellingWithReason}
                      className="gap-1.5 text-xs"
                    >
                      {cancellingWithReason ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                      Batalkan (Permintaan Pembeli)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Batalkan pesanan atas permintaan pembeli?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 text-xs">
                        <span className="block text-foreground font-medium">
                          Pembatalan tidak mengembalikan dana otomatis. Lakukan refund manual lalu tandai sudah refund.
                        </span>
                        <span className="block text-muted-foreground">
                          Status order akan diubah menjadi &ldquo;Dibatalkan&rdquo; dan status refund menjadi &ldquo;Menunggu&rdquo;.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelWithReason("permintaan_pembeli")}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Ya, Batalkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Tombol Batal Kesalahan Toko */}
              {order.status !== "dibatalkan" && order.status !== "selesai" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!(order.refund?.canCancelByStoreFault ?? true) || cancellingWithReason}
                      className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                    >
                      {cancellingWithReason ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
                      Batalkan (Kesalahan Toko)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Batalkan pesanan karena kesalahan toko?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2 text-xs">
                        <span className="block text-foreground font-medium">
                          Pembatalan tidak mengembalikan dana otomatis. Lakukan refund manual lalu tandai sudah refund.
                        </span>
                        <span className="block text-muted-foreground">
                          Gunakan opsi ini jika stok barang rusak, keliru, atau kendala operasional toko.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelWithReason("kesalahan_toko")}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Ya, Batalkan
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Tombol Tandai Sudah Refund */}
              {(order.refundStatus === "menunggu" || (order.refund?.canMarkRefunded ?? false)) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={markingRefunded}
                      className="gap-1.5 text-xs bg-primary font-semibold"
                    >
                      {markingRefunded ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Tandai Sudah Refund
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">
                        Tandai refund telah selesai?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        Tekan hanya setelah uang benar-benar dikembalikan. Pembeli akan menerima notifikasi bahwa dana telah dikembalikan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleMarkRefunded}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Ya, Sudah Ditransfer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
              <p className="font-medium text-foreground">
                {order.user?.name ?? "Pelanggan"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="break-all font-medium text-foreground">
                {order.user?.email ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="font-medium text-foreground">
                #{String(order.userId)}
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
            {order.items?.map((item, i) => (
              <div
                key={item.id}
                className={
                  i > 0 ? "border-t border-border pt-3" : undefined
                }
              >
                <p className="font-medium text-foreground">
                  {item.product?.name ?? "Produk"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(item.variant?.combination ?? []).join(" / ") ||
                    "Varian default"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatRupiah(item.priceSnapshot)}
                </p>
              </div>
            ))}
            {remainingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                +{remainingCount} item lainnya
              </p>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total harga</span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatRupiah(order.totalAmount)}
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
            {order.pickupDeadline && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Batas pengambilan:</span>
                <span>{formatDateTimeID(order.pickupDeadline)} WIB</span>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground">
                  Lokasi Pickup
                </p>
                <p className="text-xs text-muted-foreground">
                  Jl. Jenderal Basuki Rahmat No. 45, Kayutangan Heritage, Malang
                </p>
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
                {order.paymentMethod === "cod" ? "Cash/QRIS" : "Midtrans"}
              </span>
            </div>
            {order.payment && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Status Pembayaran
                  </span>
                  <span className="font-medium text-foreground capitalize">
                    {order.payment.status}
                  </span>
                </div>
                {order.payment.paidAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Dibayar
                    </span>
                    <span className="text-foreground">
                      {formatDateTimeID(order.payment.paidAt)} WIB
                    </span>
                  </div>
                )}
              </>
            )}
            {isLateSettlement && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-xs text-destructive font-medium">
                  Pembayaran diterima setelah order gugur. Hubungi admin untuk
                  proses refund manual.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-display text-lg font-bold text-foreground">
                {formatRupiah(order.totalAmount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Perpanjang Waktu Hold (hanya cod + menunggu_bayar) ── */}
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
              <span className="font-medium text-foreground">Cash/QRIS</span>{" "}
              yang belum dibayar. Cap total 2 hari sejak pesanan dibuat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ringkasan hold */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">Hold berakhir</p>
                <p className="mt-0.5 font-medium text-foreground">
                  {order.holdExpiresAt
                    ? formatDateTimeID(order.holdExpiresAt)
                    : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-xs text-muted-foreground">
                  Total diperpanjang
                </p>
                <p className="mt-0.5 font-medium text-foreground">
                  {order.holdExtendedMinutes ?? 0} menit
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
                  {Math.max(0, remainingHoldQuota)} menit
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#C99A2E] transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (((order.holdExtendedMinutes ?? 0) /
                          MAX_HOLD_EXTENSION_MINUTES) *
                          100)
                      )
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {quotaExhausted
                  ? "Kuota perpanjangan habis"
                  : `Terpakai ${Math.round(
                      ((order.holdExtendedMinutes ?? 0) /
                        MAX_HOLD_EXTENSION_MINUTES) *
                        100
                    )}% dari batas 2 hari.`}
              </p>
            </div>

            {/* Tombol tambah */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs font-medium text-muted-foreground">
                Tambah waktu:
              </span>
              <div className="flex flex-wrap gap-2">
                {HOLD_EXTENSION_CHOICES.map((minutes) => {
                  const wouldExceed = minutes > remainingHoldQuota;
                  const isLoading = extendingHold === minutes;
                  return (
                    <Button
                      key={minutes}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={quotaExhausted || wouldExceed || extendingHold !== null}
                      onClick={() => handleExtendHold(minutes)}
                      className="gap-1.5"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <PlusCircle className="h-3.5 w-3.5" />
                      )}
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

      {/* ── Ubah Status Manual ── */}
      {!isFinal && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Hash className="h-4 w-4" />
              </span>
              Ubah Status Manual
            </CardTitle>
            <CardDescription>
              Hanya transisi yang diizinkan backend yang tersedia. Pesan error
              ditampilkan langsung dari server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="sm:w-64">
                <label
                  htmlFor="status-select"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  Pilih status tujuan
                </label>
                <Select
                  value={draftStatus}
                  onValueChange={(v) => setDraftStatus(v as OrderStatus)}
                >
                  <SelectTrigger id="status-select" className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedNext.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSaveStatus}
                disabled={draftStatus === order.status || savingStatus}
                className="h-9 gap-2 sm:mb-0"
              >
                {savingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Simpan Status
              </Button>
              <p className="text-xs text-muted-foreground sm:ml-2">
                Status saat ini:{" "}
                <span className="font-medium text-foreground">
                  {STATUS_LABEL[order.status]}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Status final (tidak ada aksi) ── */}
      {isFinal && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Status{" "}
            <span className="font-semibold text-foreground">
              {STATUS_LABEL[order.status]}
            </span>{" "}
            adalah status final. Tidak ada tindakan lebih lanjut yang tersedia.
          </p>
        </div>
      )}
    </div>
  );
}
