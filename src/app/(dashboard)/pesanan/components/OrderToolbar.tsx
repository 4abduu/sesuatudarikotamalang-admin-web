import { Search, Filter, CalendarDays, X } from "lucide-react";
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
import { OrderStatus, Artisan } from "@/lib/types";

export const ALL_STATUS = "all";
export const ALL_REFUND = "all";
export const ALL_ARTISAN = "all";

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "menunggu_bayar", label: "Menunggu Bayar" },
  { value: "lunas", label: "Lunas" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
  { value: "kedaluwarsa", label: "Kedaluwarsa" },
  { value: "lewat_batas_pengambilan", label: "Lewat Batas Pengambilan" },
];

export const REFUND_STATUS_OPTIONS = [
  { value: "tidak_ada", label: "Tidak Ada Refund" },
  { value: "menunggu", label: "Menunggu Refund (Perlu Refund)" },
  { value: "selesai", label: "Refund Selesai" },
];

interface OrderToolbarProps {
  query: string;
  onQueryChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  refundFilter: string;
  onRefundChange: (val: string) => void;
  artisanFilter: string;
  onArtisanChange: (val: string) => void;
  artisans: Artisan[];
  dateFilter: string;
  onDateChange: (val: string) => void;
  onReset: () => void;
  hasActiveFilter: boolean;
}

export function OrderToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  refundFilter,
  onRefundChange,
  artisanFilter,
  onArtisanChange,
  artisans,
  dateFilter,
  onDateChange,
  onReset,
  hasActiveFilter,
}: OrderToolbarProps) {
  return (
    <Card className="mb-4 gap-0 py-0">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search input */}
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
                onChange={(e) => onQueryChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="lg:w-48">
            <label
              htmlFor="pesanan-status"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Status Pesanan
            </label>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger id="pesanan-status" className="w-full">
                <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Semua status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUS}>Semua status</SelectItem>
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refund filter */}
          <div className="lg:w-48">
            <label
              htmlFor="pesanan-refund"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Status Refund
            </label>
            <Select value={refundFilter} onValueChange={onRefundChange}>
              <SelectTrigger id="pesanan-refund" className="w-full">
                <SelectValue placeholder="Semua refund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_REFUND}>Semua refund</SelectItem>
                {REFUND_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Penjual filter */}
          <div className="lg:w-48">
            <label
              htmlFor="pesanan-artisan"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              Penjual
            </label>
            <Select value={artisanFilter} onValueChange={onArtisanChange}>
              <SelectTrigger id="pesanan-artisan" className="w-full">
                <SelectValue placeholder="Semua penjual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ARTISAN}>Semua penjual</SelectItem>
                {artisans.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.isOfficial ? `★ ${a.brandName} (Official)` : a.brandName}
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
                onChange={(e) => onDateChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Reset button */}
          {hasActiveFilter && (
            <Button
              variant="outline"
              size="default"
              onClick={onReset}
              className="h-9 lg:mb-0"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
