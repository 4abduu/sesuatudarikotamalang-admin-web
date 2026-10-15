"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  PackageOpen,
  UserPlus,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Star,
  Truck,
  Clock,
  QrCode,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Trophy,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminPageHeader, StatCard } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { apiFetch, ApiError } from "@/lib/api";
import { DashboardData, OrderStatus } from "@/lib/types";
import { products, isLowStock, lowStockVariants } from "@/data/products";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_bayar: "Menunggu Bayar",
  lunas: "Lunas",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  kedaluwarsa: "Kedaluwarsa",
  lewat_batas_pengambilan: "Lewat Batas Pengambilan",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  menunggu_bayar: "#C99A2E",
  lunas: "#6B7A3D",
  selesai: "#A8452B",
  dibatalkan: "#7A6A5A",
  kedaluwarsa: "#9B3320",
  lewat_batas_pengambilan: "#B5502F",
};

const recentActivity = [
  {
    id: "a1",
    Icon: ShoppingCart,
    accent: "#A8452B",
    text: "Pesanan baru #SDK-0248 dari Yoga Mahendra",
    time: "12 menit lalu",
  },
  {
    id: "a2",
    Icon: UserPlus,
    accent: "#6B7A3D",
    text: "Pengajuan konsinyasi baru dari Rina Wulandari (Linen House Studio)",
    time: "2 jam lalu",
  },
  {
    id: "a3",
    Icon: Star,
    accent: "#C99A2E",
    text: "Ulasan baru 5 bintang untuk Pin Enamel Apel Malang",
    time: "3 jam lalu",
  },
  {
    id: "a4",
    Icon: AlertTriangle,
    accent: "#B5502F",
    text: "Stok Kaos Heritage Kayutangan varian XL menipis (3 tersisa)",
    time: "5 jam lalu",
  },
  {
    id: "a5",
    Icon: CheckCircle2,
    accent: "#6B7A3D",
    text: "Pesanan #SDK-0244 sudah diambil oleh Dimas Saputra",
    time: "kemarin",
  },
  {
    id: "a6",
    Icon: Truck,
    accent: "#8A6A3A",
    text: "2 pesanan dijadwalkan pickup hari ini (10:00 & 17:00)",
    time: "kemarin",
  },
];

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

  // 1. Data bar chart Pendapatan 7 Hari
  const weeklyChartData = (data.revenueByDay && data.revenueByDay.length > 0)
    ? data.revenueByDay.map((d) => {
        const dateObj = new Date(d.date);
        const dayLabel = isNaN(dateObj.getTime())
          ? d.date
          : dateObj.toLocaleDateString("id-ID", { weekday: "short" });
        return {
          label: dayLabel,
          total: d.revenue,
        };
      })
    : (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const dt = new Date();
          dt.setDate(dt.getDate() - i);
          days.push({
            label: dt.toLocaleDateString("id-ID", { weekday: "short" }),
            total: 0,
          });
        }
        return days;
      })();

  const weeklyTotal = data.revenue7Days ?? weeklyChartData.reduce((s, d) => s + d.total, 0);

  // 2. Data donut chart Status Pesanan
  const statusChartData = (data.statusDistribution || [])
    .map((item) => ({
      name: STATUS_LABELS[item.status] || item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || "#7A6A5A",
    }))
    .filter((d) => d.value > 0);

  const totalOrdersCount = (data.statusDistribution || []).reduce((acc, curr) => acc + curr.count, 0);

  // 3. Data Slot Pengambilan Populer
  const slotList = (data.slotDistribution && data.slotDistribution.length > 0)
    ? data.slotDistribution.map((s) => ({
        slot: s.time,
        count: s.booked,
        isFull: s.booked >= s.capacity,
      }))
    : [
        { slot: "10:00", count: 0, isFull: false },
        { slot: "11:00", count: 0, isFull: false },
        { slot: "13:00", count: 0, isFull: false },
        { slot: "15:00", count: 0, isFull: false },
        { slot: "17:00", count: 0, isFull: false },
      ];
  const maxSlotCount = Math.max(...slotList.map((s) => s.count), 1);

  // 4. Data Produk Terlaris
  const topSellingList = (data.topSellingProducts && data.topSellingProducts.length > 0)
    ? data.topSellingProducts.map((p, idx) => ({
        rank: idx + 1,
        id: p.id,
        name: p.name,
        soldCount: p.soldCount ?? p.totalSold ?? 0,
        totalRevenue: p.totalRevenue ?? 0,
      }))
    : [];

  // 5. Data Pickup Mendatang
  const upcomingPickupList = data.upcomingPickups ?? [];

  // 6. Data Produk Stok Menipis
  const lowStockProductList = products.filter((p) => isLowStock(p, 6));

  return (
    <div>
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
          hint="Sudah dibayar, belum diambil"
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
          value={data.lowStockCount ?? lowStockProductList.length}
          hint="Varian dengan stok < 6"
          icon={AlertTriangle}
          accent="brown"
        />
      </div>

      {/* 2 & 3. Charts row: Pendapatan + Status Pesanan */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pendapatan Minggu Ini */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Pendapatan Minggu Ini
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Total {formatRupiah(weeklyTotal)} dalam 7 hari terakhir.
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
                />
                <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              Distribusi status seluruh pesanan.
            </p>
          </CardHeader>
          <CardContent>
            {statusChartData.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-12">Belum ada data pesanan</p>
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

      {/* 4 & 5. Slots + Top Products row */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Slot Pengambilan Populer */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <BarChart3 className="h-4 w-4 text-primary" />
              Slot Pengambilan Populer
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Jumlah pesanan per slot (hari ini).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {slotList.map((s) => (
              <div key={s.slot} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-xs font-semibold text-foreground">
                  {s.slot}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 rounded-md bg-primary/80 transition-all"
                    style={{ width: `${(s.count / maxSlotCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">
                  {s.count}
                </span>
                {s.isFull && (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                    Penuh
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Produk Terlaris */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <Trophy className="h-4 w-4 text-primary" />
              Produk Terlaris
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Top 5 produk berdasarkan jumlah terjual.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {topSellingList.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">Belum ada data produk terlaris</p>
            ) : (
              <ul className="divide-y divide-border">
                {topSellingList.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                        (p.rank === 1
                          ? "bg-[#C99A2E]/20 text-[#8A6A1A]"
                          : p.rank === 2
                            ? "bg-muted-foreground/15 text-muted-foreground"
                            : p.rank === 3
                              ? "bg-[#8A6A3A]/15 text-[#8A6A3A]"
                              : "bg-muted text-muted-foreground")
                      }
                    >
                      {p.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRupiah(p.totalRevenue)}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-primary">
                      {p.soldCount}× terjual
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 6. Recent activity + Upcoming pickups */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-display text-base font-bold">
              Aktivitas Terbaru
            </CardTitle>
            <Link
              href="/pesanan"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Lihat semua
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentActivity.map((a) => {
                const Icon = a.Icon;
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                      style={{ backgroundColor: a.accent + "22", color: a.accent }}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <Truck className="h-4 w-4 text-primary" />
              Pickup Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingPickupList.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada pickup tertunda.</p>
            )}
            {upcomingPickupList.map((o) => (
              <div
                key={o.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">
                    {o.orderNumber}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    Lunas
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{o.user?.name ?? "Pelanggan"}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {o.items?.[0]?.product?.name ?? "Produk"}
                  {(o.items?.length ?? 0) > 1 ? ` (+${(o.items?.length ?? 0) - 1} lainnya)` : ""}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(o.pickupDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  · {o.pickupSlot}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 7. Low stock products */}
      {lowStockProductList.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <AlertTriangle className="h-4 w-4 text-[#B5502F]" />
              Perlu Restock
            </CardTitle>
            <Link
              href="/produk"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Kelola produk
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProductList.map((p) => {
                const low = lowStockVariants(p, 6);
                return (
                  <Link
                    key={p.id}
                    href={`/produk`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-3 transition hover:border-primary/40 hover:bg-secondary/40"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                      <PackageOpen className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {p.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {low.map((v) => `${v.options.join(" / ")} (${v.stock})`).join(", ")}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
