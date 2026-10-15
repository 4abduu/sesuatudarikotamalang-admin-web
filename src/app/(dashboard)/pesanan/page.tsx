import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { OrderListContent } from "./components/OrderListContent";

export default function KelolaPesananPage() {
  return (
    <div>
      {/* Header Halaman Kelola Pesanan */}
      <AdminPageHeader
        title="Kelola Pesanan"
        description="Semua pesanan pickup Kayutangan."
      />

      {/* Konten Modular List Pesanan Terhubung API */}
      <OrderListContent />
    </div>
  );
}
