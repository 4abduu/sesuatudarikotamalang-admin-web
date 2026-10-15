"use client";

import { useState } from "react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import { Order } from "@/lib/types";
import { CameraScanner } from "./CameraScanner";
import { ManualOrderInput } from "./ManualOrderInput";
import { ScanResultCard, ScanConfirmedCard } from "./ScanResultCard";

type ScanFlowState = "idle" | "preview" | "confirmed";

export function ScanQrContent() {
  const [state, setState] = useState<ScanFlowState>("idle");
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Parse pattern SDK-XXXX dari teks QR
  const extractOrderNumber = (rawText: string): string | null => {
    const trimmed = rawText.trim();
    const match = trimmed.match(/SDK-\d{4,6}/i);
    return match ? match[0].toUpperCase() : null;
  };

  // Mencari dan memvalidasi order sebelum diserahkan
  const handleVerifyOrder = async (rawCode: string) => {
    const orderNumber = extractOrderNumber(rawCode);
    if (!orderNumber) {
      toast.error("Format QR tidak dikenali (harus memuat SDK-XXXX)");
      return;
    }

    setLoading(true);
    try {
      // Ambil detail order dari backend
      const res = await apiFetch<{ orders: Order[] }>(
        `/api/admin/orders?search=${encodeURIComponent(orderNumber)}`
      );
      const found = res.orders?.find(
        (o) => o.orderNumber.toUpperCase() === orderNumber
      );

      if (!found) {
        toast.error(`Pesanan ${orderNumber} tidak ditemukan di database.`);
        return;
      }

      setMatchedOrder(found);
      setState("preview");
      toast.success(`Pesanan ${orderNumber} ditemukan`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memeriksa nomor pesanan");
      }
    } finally {
      setLoading(false);
    }
  };

  // Konfirmasi pengambilan (POST /api/admin/scan-qr/verify)
  const handleConfirmPickup = async () => {
    if (!matchedOrder) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ message: string; order: Order }>(
        "/api/admin/scan-qr/verify",
        {
          method: "POST",
          body: JSON.stringify({ orderNumber: matchedOrder.orderNumber }),
        }
      );
      setMatchedOrder(res.order || matchedOrder);
      setState("confirmed");
      toast.success(res.message || "Pesanan telah ditandai Selesai");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal memverifikasi pengambilan");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMatchedOrder(null);
    setState("idle");
  };

  return (
    <div className="mx-auto max-w-2xl">
      {state === "confirmed" && matchedOrder ? (
        <ScanConfirmedCard order={matchedOrder} onScanAgain={handleReset} />
      ) : (
        <div className="mx-auto max-w-md">
          {/* Kamera Pemindai */}
          <CameraScanner
            onScan={handleVerifyOrder}
            disabled={state === "preview" || loading}
          />

          {/* Input Manual Cadangan */}
          {state !== "preview" && (
            <ManualOrderInput onSearch={handleVerifyOrder} loading={loading} />
          )}

          {/* Kartu Pratinjau Order & Tombol Konfirmasi Selesai */}
          {state === "preview" && matchedOrder && (
            <ScanResultCard
              order={matchedOrder}
              onConfirm={handleConfirmPickup}
              loading={loading}
              onCancel={handleReset}
            />
          )}
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
