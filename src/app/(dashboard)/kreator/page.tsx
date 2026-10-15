import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { CreatorContent } from "./components/CreatorContent";

export default function KelolaKreatorPage() {
  return (
    <div>
      {/* Header Halaman Kreator */}
      <AdminPageHeader
        title="Kelola Kreator"
        description="Kelola profil kreator aktif dan pengajuan konsinyasi baru."
      />

      {/* Konten Modular Tab Kreator & Pengajuan Terhubung API */}
      <CreatorContent />
    </div>
  );
}
