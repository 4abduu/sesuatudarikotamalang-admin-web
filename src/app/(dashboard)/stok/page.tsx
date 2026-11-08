import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { StockHistoryContent } from "./components/StockHistoryContent";

export default function RiwayatStokPage() {
  return (
    <div>
      <AdminPageHeader
        title="Riwayat Stok"
        description="Semua pergerakan stok: penyesuaian admin dan pesanan dari aplikasi."
      />
      <StockHistoryContent />
    </div>
  );
}

