"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronRight,
  ShoppingCart,
  X,
} from "lucide-react";
import { AdminPageHeader, OrderStatusBadge, EmptyState } from "@/components/admin/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orders, orderStatuses, type OrderStatus } from "@/data/admin/orders";
import { formatRupiah } from "@/lib/format";

const ALL = "Semua";

function formatDateID(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

/**
 * Kelola Pesanan page BODY — admin order list with status/date/search
 * filters. Extracted from `pesanan/page.tsx` so the same body can be
 * rendered inside the export-figma combo page (without AdminShell).
 */
export function AdminPesananContent() {
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== ALL && o.status !== statusFilter) return false;
      if (dateFilter && o.pickupDate !== dateFilter) return false;
      if (q) {
        const hay = `${o.orderNumber} ${o.buyerName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [statusFilter, dateFilter, query]);

  const hasActiveFilter =
    statusFilter !== ALL || dateFilter !== "" || query.trim() !== "";

  const resetFilters = () => {
    setStatusFilter(ALL);
    setDateFilter("");
    setQuery("");
  };

  return (
    <div>
      <AdminPageHeader
        title="Kelola Pesanan"
        description="Semua pesanan pickup Kayutangan."
      />

      {/* Toolbar */}
      <Card className="mb-4 gap-0 py-0">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1">
              <label
                htmlFor="pesanan-search"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Cari pesanan
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pesanan-search"
                  type="search"
                  placeholder="No. pesanan / nama pembeli…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="lg:w-52">
              <label
                htmlFor="pesanan-status"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="pesanan-status" className="w-full">
                  <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua status</SelectItem>
                  {orderStatuses.map((s: OrderStatus) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date filter */}
            <div className="lg:w-48">
              <label
                htmlFor="pesanan-date"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                Tanggal pickup
              </label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pesanan-date"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {hasActiveFilter && (
              <Button
                variant="outline"
                size="default"
                onClick={resetFilters}
                className="h-9 lg:mb-0"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Result count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-foreground">{orders.length}</span>{" "}
          pesanan
        </p>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={ShoppingCart}
              title="Tidak ada pesanan ditemukan"
              description="Coba ubah filter pencarian atau reset filter untuk melihat semua pesanan."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <Card className="hidden overflow-hidden py-0 lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    No. Pesanan
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Pembeli
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Produk
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Jadwal Pickup
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Bayar
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="hover:bg-muted/30">
                    <TableCell className="px-4 py-3">
                      <span className="font-display text-sm font-bold text-foreground">
                        {o.orderNumber}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                      {o.buyerName}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">
                          {o.productName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {o.variantName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-foreground">
                        {formatDateID(o.pickupDate)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {o.pickupSlot}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground">
                      {o.paymentMethod}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                      {formatRupiah(o.total)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-primary hover:bg-primary/10"
                      >
                        <Link href={`/admin/pesanan/${o.id}`}>
                          Detail
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile stacked cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filtered.map((o) => (
              <Card key={o.id} className="gap-3 py-4">
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-bold text-foreground">
                        {o.orderNumber}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.buyerName}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Produk
                      </p>
                      <p className="text-sm text-foreground">{o.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.variantName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Pickup
                      </p>
                      <p className="text-sm text-foreground">
                        {formatDateID(o.pickupDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.pickupSlot} · {o.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Total
                      </p>
                      <p className="font-display text-base font-bold text-foreground">
                        {formatRupiah(o.total)}
                      </p>
                    </div>
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="h-9 gap-1"
                    >
                      <Link href={`/admin/pesanan/${o.id}`}>
                        Detail
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
