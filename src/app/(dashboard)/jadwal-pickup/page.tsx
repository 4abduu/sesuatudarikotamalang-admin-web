import React from "react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { PickupScheduleContent } from "./components/PickupScheduleContent";

export default function JadwalPickupPage() {
  return (
    <div>
      {/* Header Halaman Jadwal Pickup */}
      <AdminPageHeader
        title="Jadwal Pickup"
        description="Atur jam operasional dan slot pengambilan pesanan."
      />

      {/* Konten Modular Jadwal & Slot Pickup Terhubung API */}
      <PickupScheduleContent />
    </div>
  );
}
