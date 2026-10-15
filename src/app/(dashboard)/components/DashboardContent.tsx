"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { DashboardData } from "@/lib/types";

import { DashboardStatCards } from "./DashboardStatCards";
import { RevenueChartCard } from "./RevenueChartCard";
import { OrderStatusDonutCard } from "./OrderStatusDonutCard";
import { PopularSlotsCard } from "./PopularSlotsCard";
import { TopSellingCard } from "./TopSellingCard";
import { RecentActivityCard } from "./RecentActivityCard";
import { UpcomingPickupsCard } from "./UpcomingPickupsCard";
import { LowStockAlertCard } from "./LowStockAlertCard";

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<DashboardData>("/api/admin/dashboard")
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Gagal memuat data dashboard dari server");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    apiFetch<DashboardData>("/api/admin/dashboard")
      .then((res) => {
        if (isSubscribed) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError("Gagal memuat data dashboard dari server");
          }
          setLoading(false);
        }
      });
    return () => {
      isSubscribed = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data dashboard…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Dashboard</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "Terjadi kesalahan yang tidak diketahui."}
            </p>
          </div>
          <Button onClick={fetchDashboard} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan 4 Kartu Stat */}
      <DashboardStatCards
        ordersToday={data.ordersToday ?? 0}
        readyForPickup={data.readyForPickup ?? 0}
        pendingApplications={data.pendingApplications ?? 0}
        lowStockCount={data.lowStockCount ?? 0}
      />

      {/* 2 & 3. Baris Grafik: Pendapatan Minggu Ini + Donut Status Pesanan */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChartCard
          revenueByDay={data.revenueByDay}
          revenue7Days={data.revenue7Days}
        />
        <OrderStatusDonutCard statusDistribution={data.statusDistribution} />
      </div>

      {/* 4 & 5. Baris Slot Populer + Top 5 Produk Terlaris */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PopularSlotsCard slotDistribution={data.slotDistribution} />
        <TopSellingCard topSellingProducts={data.topSellingProducts} />
      </div>

      {/* 6. Baris Aktivitas Terbaru + Pickup Mendatang */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivityCard />
        <UpcomingPickupsCard upcomingPickups={data.upcomingPickups} />
      </div>

      {/* 7. Baris Peringatan Stok Menipis */}
      <LowStockAlertCard />
    </div>
  );
}
