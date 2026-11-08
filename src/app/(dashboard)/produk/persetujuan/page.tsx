import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { ApprovalContent } from "./components/ApprovalContent";

export default function PersetujuanProdukPage() {
  return (
    <div>
      <AdminPageHeader
        title="Persetujuan Produk"
        description="Produk baru dari kreator tayang di katalog setelah disetujui admin."
      />
      <ApprovalContent />
    </div>
  );
}

