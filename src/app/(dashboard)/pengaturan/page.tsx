import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { SettingsContent } from "./components/SettingsContent";

export default function PengaturanSistemPage() {
  return (
    <div>
      {/* Header Halaman Pengaturan */}
      <AdminPageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi operasional toko, durasi reservasi hold, batas pengambilan, dan kontak admin."
      />

      {/* Konten Modular Pengaturan Terhubung API */}
      <SettingsContent />
    </div>
  );
}
