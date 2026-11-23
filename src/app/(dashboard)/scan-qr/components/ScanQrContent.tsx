"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import { Order } from "@/lib/types";
import { CameraScanner } from "./CameraScanner";
import { ManualOrderInput } from "./ManualOrderInput";
import { ScanResultCard, ScanConfirmedCard } from "./ScanResultCard";

type ScanFlowState = "idle" | "preview" | "confirmed";

// QR berisi teks polos nomor pesanan, mis. "SDK-1234" (4 sampai 6 digit).
const ORDER_NUMBER_PATTERN = /^SDK-\d{4,6}$/;

// Memangkas spasi/baris baru lalu menolak semua pola lain sebelum memanggil API.
const extractOrderNumber = (rawText: string): string | null => {
  const candidate = rawText.trim().toUpperCase();
  return ORDER_NUMBER_PATTERN.test(candidate) ? candidate : null;
};

export function ScanQrContent() {
  const [state, setState] = useState<ScanFlowState>("idle");
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  // Kamera pernah diaktifkan oleh admin: setelah "Scan lagi" dinyalakan otomatis.
  const [cameraWanted, setCameraWanted] = useState(false);
  // Penjaga request: hanya satu request aktif walau QR yang sama terbaca berulang.
  const inFlightRef = useRef(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state !== "preview") return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }, [state]);

  // Mencari dan memvalidasi order sebelum diserahkan
  const handleVerifyOrder = async (rawCode: string) => {
    if (inFlightRef.current) return;
    const orderNumber = extractOrderNumber(rawCode);
    if (!orderNumber) {
      setLookupError("Format QR tidak dikenali. Nomor pesanan harus seperti SDK-1234.");
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setLookupError(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await apiFetch<{ orders: Order[] }>(
        `/api/admin/orders?search=${encodeURIComponent(orderNumber)}`,
        { signal: controller.signal }
      );
      const found = res.orders?.find((o) => o.orderNumber.toUpperCase() === orderNumber);

      if (!found) {
        setLookupError(`Pesanan ${orderNumber} tidak ditemukan. Periksa nomor pesanan atau pindai QR lain.`);
        return;
      }

      setMatchedOrder(found);
      setState("preview");
      toast.success(`Pesanan ${orderNumber} ditemukan`);
    } catch (err) {
      setLookupError(controller.signal.aborted
        ? "Server terlalu lama merespons. Periksa koneksi, lalu coba lagi."
        : err instanceof ApiError ? err.message : "Gagal memeriksa nomor pesanan. Periksa koneksi, lalu coba lagi.");
    } finally {
      window.clearTimeout(timeout);
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  // Konfirmasi pengambilan (POST /api/admin/scan-qr/verify)
  const handleConfirmPickup = async () => {
    if (!matchedOrder || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const res = await apiFetch<{ message: string; order: Order }>("/api/admin/scan-qr/verify", {
        method: "POST",
        body: JSON.stringify({ orderNumber: matchedOrder.orderNumber }),
      });
      setMatchedOrder(res.order || matchedOrder);
      setState("confirmed");
      toast.success(res.message || "Pesanan telah ditandai Selesai");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
        // Backend membalas 400 dengan objek order (mis. belum lunas/sudah selesai):
        // tampilkan status order itu supaya admin tahu penyebabnya.
        const data = err.data as { order?: Order } | undefined;
        if (err.status === 400 && data?.order) {
          setMatchedOrder(data.order);
        }
      } else {
        toast.error("Gagal memverifikasi pengambilan");
      }
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLookupError(null);
    setMatchedOrder(null);
    setState("idle");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {state === "confirmed" && matchedOrder ? (
        <ScanConfirmedCard order={matchedOrder} onScanAgain={handleReset} />
      ) : (
        <div className="mx-auto max-w-md">
          {/* Kamera Pemindai. Tidak ikut di-remount saat pindah idle <-> preview. */}
          <CameraScanner
            onScan={handleVerifyOrder}
            disabled={state === "preview" || loading}
            processing={state === "idle" && loading}
            autoStart={cameraWanted}
            onActiveChange={setCameraWanted}
          />
          {lookupError && <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{lookupError}</p>}

          {/* Input manual selalu tersedia sebagai cadangan (izin ditolak, tanpa HTTPS, kamera hitam, decoder gagal) */}
          {state !== "preview" && <ManualOrderInput onSearch={handleVerifyOrder} loading={loading} />}

          {/* Kartu Pratinjau Order & Tombol Konfirmasi Selesai */}
          <div ref={resultRef}>
            {state === "preview" && matchedOrder && (
              <ScanResultCard
                order={matchedOrder}
                onConfirm={handleConfirmPickup}
                loading={loading}
                onCancel={handleReset}
              />
            )}
          </div>
        </div>
      )}

      {/* Animasi Garis Laser Scan */}
      <style>{`
        @keyframes scanline {
          0%   { transform: translateY(-100px); opacity: 0.3; }
          50%  { transform: translateY(0);     opacity: 1;   }
          100% { transform: translateY(100px);  opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
