"use client";

import { useRef, useState } from "react";
import {
  ScanLine,
  Camera,
  CheckCircle2,
  Loader2,
  Package,
  RefreshCw,
  QrCode,
  Clock,
  User,
  MapPin,
  Sparkles,
  Search,
} from "lucide-react";
import { AdminPageHeader, OrderStatusBadge } from "@/components/admin/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { orders, type Order } from "@/data/admin/orders";
import { formatRupiah } from "@/lib/format";
import { toast } from "sonner";

type ScanState = "idle" | "scanning" | "scanned-result" | "confirmed";

const PICKUP_LOCATION =
  "Jl. Jend. Basuki Rahmat No. 45, Kayutangan Heritage, Malang";

function pickScanOrder(): Order {
  return orders.find((o) => o.status === "Lunas") ?? orders[0];
}

function formatDateID(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Scan QR Pickup page BODY — 4-state scan flow (idle → scanning → result →
 * confirmed). Extracted from `scan-qr/page.tsx` so the same body can be
 * rendered inside the export-figma combo page (without AdminShell).
 *
 * Exposes `ScanConfirmedCard` for the export-figma Modals section so the
 * "Konfirmasi: Barang Diambil" success state appears as a static inline
 * card.
 */
export function AdminScanQrContent() {
  const [state, setState] = useState<ScanState>("idle");
  const [matched, setMatched] = useState<Order | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const simulateScan = () => {
    if (state === "scanning") return;
    setState("scanning");
    const order = pickScanOrder();
    timerRef.current = setTimeout(() => {
      setMatched(order);
      setState("scanned-result");
      toast.success("QR berhasil dipindai", {
        description: `Pesanan ${order.orderNumber} ditemukan.`,
      });
    }, 1200);
  };

  const confirmPickup = () => {
    if (!matched) return;
    setState("confirmed");
    toast.success(`Pesanan ${matched.orderNumber} dikonfirmasi diambil`, {
      description: "Stok diperbarui secara otomatis.",
    });
  };

  const handleManualSearch = () => {
    const query = manualInput.trim().toUpperCase();
    if (!query) {
      setManualError("Masukkan nomor pesanan");
      return;
    }
    const found = orders.find((o) => o.orderNumber.toUpperCase() === query);
    if (found) {
      setMatched(found);
      setState("scanned-result");
      setShowManualInput(false);
      setManualInput("");
      setManualError("");
      toast.success("Pesanan ditemukan", {
        description: found.orderNumber,
      });
    } else {
      setManualError("Pesanan tidak ditemukan. Periksa nomor pesanan.");
    }
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMatched(null);
    setState("idle");
    setShowManualInput(false);
    setManualInput("");
    setManualError("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Scan QR Pickup"
        description="Pindai kode QR pesanan untuk verifikasi pengambilan."
      />

      {/* Camera viewport + result */}
      <div className="mx-auto max-w-2xl">
        {/* Camera viewport (shown until confirmed) */}
        {state !== "confirmed" && (
          <div className="mx-auto max-w-md">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {/* Dark camera backdrop */}
              <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-muted/80" />

              {/* Scanner frame corners */}
              <div className="pointer-events-none absolute inset-8">
                {/* TL */}
                <span className="absolute left-0 top-0 h-10 w-10 border-l-4 border-t-4 border-primary" />
                {/* TR */}
                <span className="absolute right-0 top-0 h-10 w-10 border-r-4 border-t-4 border-primary" />
                {/* BL */}
                <span className="absolute bottom-0 left-0 h-10 w-10 border-b-4 border-l-4 border-primary" />
                {/* BR */}
                <span className="absolute bottom-0 right-0 h-10 w-10 border-b-4 border-r-4 border-primary" />

                {/* Center placeholder */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  {state === "scanning" ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <p className="font-display text-sm font-semibold text-foreground">
                        Memindai…
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="grid h-14 w-14 place-items-center rounded-full bg-card/80 text-muted-foreground shadow-sm">
                        <Camera className="h-7 w-7" />
                      </span>
                      <p className="font-display text-sm font-semibold text-foreground">
                        Kamera Belum Aktif
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Arahkan kamera ke QR pesanan
                      </p>
                    </>
                  )}
                </div>

                {/* Pulsing scan-line */}
                <div className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden">
                  <span
                    className="block h-full w-full animate-[scanline_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent"
                    style={{ boxShadow: "0 0 12px 2px #A8452B88" }}
                  />
                </div>
              </div>

              {/* Caption badge */}
              <div className="absolute left-1/2 top-3 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-sm">
                  <QrCode className="h-3.5 w-3.5" />
                  Mode demo — kamera disimulasikan
                </span>
              </div>
            </div>

            {/* Scan button */}
            <div className="mt-4">
              <Button
                onClick={simulateScan}
                disabled={state === "scanning"}
                className="h-11 w-full gap-2 text-sm"
                size="lg"
              >
                {state === "scanning" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memindai…
                  </>
                ) : (
                  <>
                    <ScanLine className="h-4 w-4" />
                    Simulasikan Scan Berhasil
                  </>
                )}
              </Button>
            </div>

            {/* Manual input fallback */}
            <div className="mt-3 text-center">
              {!showManualInput ? (
                <button
                  type="button"
                  onClick={() => setShowManualInput(true)}
                  className="text-xs font-medium text-muted-foreground hover:text-primary"
                >
                  Atau input nomor pesanan manual
                </button>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={manualInput}
                    onChange={(e) => {
                      setManualInput(e.target.value);
                      setManualError("");
                    }}
                    placeholder="SDK-XXXX"
                    className="h-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualSearch();
                    }}
                  />
                  <Button
                    onClick={handleManualSearch}
                    variant="outline"
                    className="h-10 gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Cari
                  </Button>
                </div>
              )}
              {manualError && (
                <p className="mt-2 text-xs text-destructive">{manualError}</p>
              )}
            </div>
          </div>
        )}

        {/* Scan result card */}
        {state === "scanned-result" && matched && (
          <Card className="mt-6 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
                  <Package className="h-4 w-4" />
                </span>
                Hasil Scan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground">
                    {matched.orderNumber}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {matched.buyerName}
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {matched.productName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Varian: {matched.variantName}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateID(matched.pickupDate)} · {matched.pickupSlot}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {PICKUP_LOCATION}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <OrderStatusBadge status={matched.status} />
                  <p className="font-display text-base font-bold text-foreground">
                    {formatRupiah(matched.total)}
                  </p>
                </div>
              </div>

              <Button
                onClick={confirmPickup}
                className="h-11 w-full gap-2"
                size="lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                Konfirmasi: Barang Diambil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirmed state */}
        {state === "confirmed" && matched && (
          <ScanConfirmedCard order={matched} onScanAgain={reset} />
        )}
      </div>

      {/* Inline keyframes for the scan-line animation */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-90px); opacity: 0.4; }
          50%  { transform: translateY(0);    opacity: 1;   }
          100% { transform: translateY(90px); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/**
 * The success-state card shown after the admin confirms a pickup. Exported
 * so the export-figma Modals section can render it inline as a static card.
 */
export function ScanConfirmedCard({
  order,
  onScanAgain,
}: {
  order: Order;
  onScanAgain?: () => void;
}) {
  return (
    <Card className="border-accent/40">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent/15 text-accent">
          <CheckCircle2 className="h-9 w-9" />
        </span>
        <div>
          <p className="font-display text-xl font-bold text-foreground">
            Pesanan selesai. Stok diperbarui.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pesanan{" "}
            <span className="font-semibold text-foreground">
              {order.orderNumber}
            </span>{" "}
            — {order.buyerName} telah mengambil barang.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          Stok {order.productName} ({order.variantName}) dikurangi 1
        </span>
        {onScanAgain && (
          <Button
            onClick={onScanAgain}
            variant="outline"
            className="mt-2 h-10 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Scan Lagi
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
