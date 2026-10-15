import { ShoppingCart, Clock, UserPlus, AlertTriangle } from "lucide-react";
import { StatCard } from "@/app/(dashboard)/components/admin-ui";

interface DashboardStatCardsProps {
  ordersToday: number;
  readyForPickup: number;
  pendingApplications: number;
  lowStockCount: number;
}

export function DashboardStatCards({
  ordersToday,
  readyForPickup,
  pendingApplications,
  lowStockCount,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Pesanan Hari Ini"
        value={ordersToday}
        hint={`${ordersToday} pesanan masuk/ambil`}
        icon={ShoppingCart}
        accent="primary"
      />
      <StatCard
        label="Menunggu Diambil"
        value={readyForPickup}
        hint="Sudah dibayar, belum diambil"
        icon={Clock}
        accent="mustard"
      />
      <StatCard
        label="Pengajuan Konsinyasi Baru"
        value={pendingApplications}
        hint="Perlu ditinjau"
        icon={UserPlus}
        accent="accent"
      />
      <StatCard
        label="Produk Stok Menipis"
        value={lowStockCount}
        hint="Varian dengan stok < 6"
        icon={AlertTriangle}
        accent="brown"
      />
    </div>
  );
}
