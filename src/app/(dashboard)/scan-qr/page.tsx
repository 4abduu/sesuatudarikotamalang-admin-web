import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { ScanQrContent } from "./components/ScanQrContent";

export default function ScanQrPage() {
  return (
    <div>
      {/* Header Halaman Scan QR */}
      <AdminPageHeader
        title="Scan QR Pickup"
        description="Pindai kode QR pesanan pelanggan untuk verifikasi pengambilan barang di toko."
      />

      {/* Konten Scanner Kamera & Verifikasi Terhubung API */}
      <ScanQrContent />
    </div>
  );
}
