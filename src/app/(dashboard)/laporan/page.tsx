import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { MonthlyReportContent } from "./components/MonthlyReportContent";

export default function LaporanBulananPage() {
  return (
    <div>
      <AdminPageHeader
        title="Laporan Bulanan"
        description="Rekap penjualan, sisa stok, dan bagi hasil per kreator."
      />
      <MonthlyReportContent />
    </div>
  );
}

