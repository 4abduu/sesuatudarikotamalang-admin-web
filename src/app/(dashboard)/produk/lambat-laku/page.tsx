import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { SlowMoversContent } from "./components/SlowMoversContent";

export default function ProdukLambatLakuPage() {
  return (
    <div>
      <AdminPageHeader
        title="Produk Lambat Laku"
        description="Produk yang sudah lama tidak terjual. Peringatan di bulan ke-5, siap ditarik di bulan ke-6."
      />
      <SlowMoversContent />
    </div>
  );
}

