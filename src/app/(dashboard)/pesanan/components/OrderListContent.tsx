"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { ShoppingCart, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Order } from "@/lib/types";

import { OrderToolbar, ALL_STATUS } from "./OrderToolbar";
import { OrderTable } from "./OrderTable";

export function OrderListContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const [dateFilter, setDateFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ orders: Order[] }>("/api/admin/orders");
      setOrders(res.orders || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat daftar pesanan dari server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const hasActiveFilter =
    statusFilter !== ALL_STATUS || dateFilter !== "" || query.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter(ALL_STATUS);
    setDateFilter("");
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== ALL_STATUS && o.status !== statusFilter) {
        return false;
      }
      if (dateFilter) {
        const orderDateStr = o.pickupDate ? o.pickupDate.split("T")[0] : "";
        if (orderDateStr !== dateFilter) return false;
      }
      if (q) {
        const orderNoMatch = (o.orderNumber || "").toLowerCase().includes(q);
        const buyerMatch = (o.user?.name || "").toLowerCase().includes(q);
        const emailMatch = (o.user?.email || "").toLowerCase().includes(q);
        if (!orderNoMatch && !buyerMatch && !emailMatch) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFilter, query]);

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data pesanan…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Pesanan</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchOrders} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar Filter */}
      <OrderToolbar
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReset={handleResetFilters}
        hasActiveFilter={hasActiveFilter}
      />

      {/* Result Count Info */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-foreground">{orders.length}</span>{" "}
          pesanan
        </p>
      </div>

      {/* List / Table Pesanan */}
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
        <OrderTable orders={filtered} />
      )}
    </div>
  );
}
