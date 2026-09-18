"use client";

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
import { AdminPageHeader, StatCard } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/admin/admin-ui";
import { orders, orderStatuses, type OrderStatus } from "@/data/admin/orders";
import { pendingApplications } from "@/data/admin/applications";
import {
  products,
  isLowStock,
  lowStockVariants,
} from "@/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";

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

const STATUS_COLORS: Record<OrderStatus, string> = {
  "Menunggu Bayar": "#C99A2E",
  Lunas: "#6B7A3D",
  Selesai: "#A8452B",
  Dibatalkan: "#7A6A5A",
  // Kedaluwarsa: "#9B3320",
  // "Lewat Batas Pengambilan": "#B5502F",
};

const TIME_SLOTS = ["10:00", "11:00", "13:00", "15:00", "17:00"];

/**
 * Admin Dashboard page BODY — rendered inside the AdminShell content area.
 *
 * Extracted from `app/admin/(authed)/page.tsx` so the same content can be
 * rendered inside the export-figma combo page (without the AdminShell).
 * Recharts is purely client-side and renders statically for export.
 */
export function AdminDashboardContent() {
  const today = new Date().toISOString().slice(0, 10);
  const ordersToday = orders.filter(
    (o) => o.createdAt === today || o.pickupDate === today,
  ).length;
  const waitingPickup = orders.filter((o) => o.status === "Lunas").length;
  const newApplications = pendingApplications.length;
  const lowStockProducts = products.filter((p) => isLowStock(p, 6));
  const lowStockCount = lowStockProducts.length;
  const upcomingPickups = orders.filter((o) => o.status === "Lunas").slice(0, 4);

  // 2. Pendapatan Minggu Ini — bar chart, last 7 days
  const weeklyData = (() => {
    const days: { label: string; total: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayOrders = orders.filter(
        (o) =>
          o.createdAt === iso &&
          (o.status === "Lunas" || o.status === "Selesai"),
      );
      days.push({
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        total: dayOrders.reduce((s, o) => s + o.total, 0),
        count: dayOrders.length,
      });
    }
    return days;
  })();

  const weeklyTotal = weeklyData.reduce((s, d) => s + d.total, 0);
  const weeklyCount = weeklyData.reduce((s, d) => s + d.count, 0);

  // 3. Status Pesanan — donut chart
  const statusData = orderStatuses
    .map((status) => ({
      name: status,
      value: orders.filter((o) => o.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);
  const totalOrders = orders.length;

  // 4. Slot Pengambilan Populer
  const slotData = TIME_SLOTS.map((slot) => {
    const count = orders.filter((o) => o.pickupSlot === slot).length;
    return { slot, count, isFull: count >= 3 };
  });
  const maxSlotCount = Math.max(...slotData.map((s) => s.count), 1);

  // 5. Produk Terlaris — top 5 by soldCount
  const topProducts = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      soldCount: p.soldCount,
      price: p.price,
    }));

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
          value={ordersToday}
          hint={`${ordersToday} pesanan masuk/ambil`}
          icon={ShoppingCart}
          accent="primary"
        />
        <StatCard
          label="Menunggu Diambil"
          value={waitingPickup}
          hint="Sudah dibayar, belum diambil"
          icon={Clock}
          accent="mustard"
        />
        <StatCard
          label="Pengajuan Konsinyasi Baru"
          value={newApplications}
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
              Total {formatRupiah(weeklyTotal)} dari {weeklyCount} pesanan lunas/selesai.
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative h-[160px] w-[160px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold text-foreground">
                    {totalOrders}
                  </span>
                  <span className="text-[10px] text-muted-foreground">pesanan</span>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5">
                {statusData.map((s) => (
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
              Jumlah pesanan per slot (semua status).
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {slotData.map((s) => (
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
            <ul className="divide-y divide-border">
              {topProducts.map((p) => (
                <li key={p.rank} className="flex items-center gap-3 px-5 py-3">
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
                      {formatRupiah(p.price)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary">
                    {p.soldCount}× terjual
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Existing: Recent activity + Upcoming pickups */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="font-display text-base font-bold">
              Aktivitas Terbaru
            </CardTitle>
            <Link
              href="/admin/pesanan"
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
            {upcomingPickups.length === 0 && (
              <p className="text-sm text-muted-foreground">Tidak ada pickup tertunda.</p>
            )}
            {upcomingPickups.map((o) => (
              <div
                key={o.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">
                    {o.orderNumber}
                  </span>
                  <OrderStatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-foreground">{o.buyerName}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {o.productName} · {o.variantName}
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

      {/* Low stock products */}
      {lowStockProducts.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
              <AlertTriangle className="h-4 w-4 text-[#B5502F]" />
              Perlu Restock
            </CardTitle>
            <Link
              href="/admin/produk"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Kelola produk
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((p) => {
                const low = lowStockVariants(p, 6);
                return (
                  <Link
                    key={p.id}
                    href={`/admin/produk`}
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
