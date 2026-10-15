import React from "react";
import Link from "next/link";
import { QrCode } from "lucide-react";
import { AdminPageHeader } from "@/app/(dashboard)/components/admin-ui";
import { Button } from "@/components/ui/button";
import { DashboardContent } from "./components/DashboardContent";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Halaman Utama */}
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan aktivitas toko hari ini."
      >
        <Button asChild size="sm" className="gap-2">
          <Link href="/scan-qr">
            <QrCode className="h-4 w-4" />
            Buka Scan QR Pickup
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Konten Dashboard Modular (Cards & Charts) */}
      <DashboardContent />
    </div>
  );
}
