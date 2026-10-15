import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { ReviewContent } from "./components/ReviewContent";

export default function KelolaUlasanPage() {
  return (
    <div>
      {/* Header Halaman Ulasan */}
      <AdminPageHeader
        title="Kelola Ulasan"
        description="Moderasi ulasan dan penilaian dari pembeli toko."
      />

      {/* Konten Modular List Ulasan Terhubung API */}
      <ReviewContent />
    </div>
  );
}
