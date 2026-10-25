import { ShoppingCart, Clock, UserPlus, AlertTriangle, Wallet } from "lucide-react";
import { StatCard } from "@/app/(dashboard)/components/admin-ui";

interface DashboardStatCardsProps {
  ordersToday: number;
  readyForPickup: number;
  pendingApplications: number;
  lowStockCount: number;
  pendingRefundCount?: number;
}

export function DashboardStatCards({
  ordersToday,
  readyForPickup,
  pendingApplications,
  lowStockCount,
  pendingRefundCount = 0,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        label="Pengajuan Baru"
        value={pendingApplications}
        hint="Perlu ditinjau"
        icon={UserPlus}
        accent="accent"
      />
      <StatCard
        label="Stok Menipis"
        value={lowStockCount}
        hint="Varian dengan stok < 6"
        icon={AlertTriangle}
        accent="brown"
      />
      <StatCard
        label="Perlu Refund"
        value={pendingRefundCount}
        hint="Menunggu transfer manual"
        icon={Wallet}
        accent="brown"
      />
    </div>
  );
}
