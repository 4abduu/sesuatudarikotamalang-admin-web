"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  UserPlus,
  AlertTriangle,
  Clock,
  QrCode,
  TrendingUp,
  PieChart as PieChartIcon,
  Trophy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { apiFetch, ApiError } from "@/lib/api";
import { DashboardData, OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_bayar: "Menunggu Bayar",
  lunas: "Lunas",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  kedaluwarsa: "Kedaluwarsa",
  lewat_batas_pengambilan: "Lewat Batas Pickup",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  menunggu_bayar: "#C99A2E",
  lunas: "#6B7A3D",
  selesai: "#A8452B",
  dibatalkan: "#7A6A5A",
  kedaluwarsa: "#9B3320",
  lewat_batas_pengambilan: "#B5502F",
};

export function AdminDashboardContent() {
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
      <div>
        <AdminPageHeader
          title="Dashboard"
          description="Ringkasan aktivitas toko hari ini."
        />
        <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Memuat data dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <AdminPageHeader
          title="Dashboard"
          description="Ringkasan aktivitas toko hari ini."
        />
        <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <h3 className="text-base font-bold text-foreground">Gagal Memuat Dashboard</h3>
              <p className="mt-1 text-sm text-muted-foreground">{error || "Terjadi kesalahan yang tidak diketahui."}</p>
            </div>
            <Button onClick={fetchDashboard} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusChartData = (data.statusDistribution || [])
    .map((item) => ({
      name: STATUS_LABELS[item.status] || item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || "#7A6A5A",
    }))
    .filter((d) => d.value > 0);

  const totalOrdersCount = statusChartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Ringkasan aktivitas toko hari ini."
      >
        <Button asChild size="sm" className="gap-2">
          <Link href="/admin/scan-qr">
            <QrCode className="h-4 w-4" />
            Buka Scan QR Pickup
          </Link>
        </Button>
      </AdminPageHeader>

      {/* 1. Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pesanan Hari Ini"
          value={data.ordersToday ?? 0}
          hint={`${data.ordersToday ?? 0} pesanan masuk/ambil`}
          icon={ShoppingCart}
          accent="primary"
        />
        <StatCard
          label="Menunggu Diambil"
          value={data.readyForPickup ?? 0}
          hint="Sudah dibayar, siap diambil"
          icon={Clock}
          accent="mustard"
        />
        <StatCard
          label="Pengajuan Konsinyasi Baru"
          value={data.pendingApplications ?? 0}
          hint="Perlu ditinjau"
          icon={UserPlus}
          accent="accent"
        />
        <StatCard
          label="Produk Stok Menipis"
          value={data.lowStockCount ?? 0}
          hint="Produk/varian stok rendah"
          icon={AlertTriangle}
          accent="brown"
        />
      </div>

      {/* 2 & 3. Row: Revenue 7 days + Status Pesanan */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pendapatan 7 Hari */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pendapatan 7 Hari Terakhir
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Total estimasi pendapatan dari pesanan yang berhasil.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Pendapatan (7 Hari)</span>
            <span className="mt-2 font-display text-3xl font-extrabold text-foreground sm:text-4xl">
              {formatRupiah(data.revenue7Days ?? 0)}
            </span>
          </CardContent>
        </Card>

        {/* Status Pesanan */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <PieChartIcon className="h-4 w-4 text-primary" />
              Status Pesanan
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Distribusi status seluruh pesanan toko.
            </p>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-8">Belum ada data pesanan</p>
            ) : (
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative h-[160px] w-[160px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {statusChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-bold text-foreground">
                      {totalOrdersCount}
                    </span>
                    <span className="text-[10px] text-muted-foreground">pesanan</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-1.5">
                  {statusChartData.map((s) => (
                    <li key={s.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="flex-1 text-muted-foreground">{s.name}</span>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Top Selling Products */}
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <Trophy className="h-4 w-4 text-primary" />
            Produk Terlaris
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Produk paling banyak diminati pelanggan.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {(!data.topSellingProducts || data.topSellingProducts.length === 0) ? (
            <p className="p-6 text-center text-xs text-muted-foreground">Belum ada data produk terlaris</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.topSellingProducts.map((p, idx) => {
                const rank = idx + 1;
                return (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                        (rank === 1
                          ? "bg-[#C99A2E]/20 text-[#8A6A1A]"
                          : rank === 2
                            ? "bg-muted-foreground/15 text-muted-foreground"
                            : rank === 3
                              ? "bg-[#8A6A3A]/15 text-[#8A6A3A]"
                              : "bg-muted text-muted-foreground")
                      }
                    >
                      {rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Pendapatan: {formatRupiah(p.totalRevenue)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-primary">
                      {p.totalSold}× terjual
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
