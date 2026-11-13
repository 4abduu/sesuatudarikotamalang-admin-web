"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingCart, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { Order, Artisan } from "@/lib/types";
import { PaginationBar } from "@/components/shared/PaginationBar";

import { OrderToolbar, ALL_STATUS, ALL_REFUND, ALL_ARTISAN } from "./OrderToolbar";
import { OrderTable } from "./OrderTable";

export function OrderListContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const [refundFilter, setRefundFilter] = useState(ALL_REFUND);
  const [artisanFilter, setArtisanFilter] = useState(ALL_ARTISAN);
  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query ±400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Load artisans sekali
  useEffect(() => {
    apiFetch<{ artisans: Artisan[] }>("/api/admin/artisans?status=aktif")
      .then((res) => setArtisans(res.artisans || []))
      .catch(() => setArtisans([]));
  }, []);

  const fetchOrders = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pageSize));

    if (debouncedQuery.trim()) params.set("search", debouncedQuery.trim());
    if (statusFilter !== ALL_STATUS) params.set("status", statusFilter);
    if (refundFilter !== ALL_REFUND) params.set("refundStatus", refundFilter);
    if (artisanFilter !== ALL_ARTISAN) params.set("artisanId", String(artisanFilter));
    if (dateFilter) params.set("pickupDate", dateFilter);

    try {
      const res = await apiFetch<{
        orders: Order[];
        pagination?: { page: number; limit: number; total: number; totalPages: number };
      }>(`/api/admin/orders?${params.toString()}`, {
        signal: controller.signal,
      });

      setOrders(res.orders || []);
      if (res.pagination) {
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } else {
        setTotal(res.orders?.length || 0);
        setTotalPages(1);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat daftar pesanan dari server");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery, statusFilter, refundFilter, artisanFilter, dateFilter]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const hasActiveFilter =
    statusFilter !== ALL_STATUS ||
    refundFilter !== ALL_REFUND ||
    artisanFilter !== ALL_ARTISAN ||
    dateFilter !== "" ||
    query.trim() !== "";

  const handleResetFilters = () => {
    setStatusFilter(ALL_STATUS);
    setRefundFilter(ALL_REFUND);
    setArtisanFilter(ALL_ARTISAN);
    setDateFilter("");
    setQuery("");
    setDebouncedQuery("");
    setPage(1);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data pesanan…</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
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
        onQueryChange={(q) => {
          setQuery(q);
        }}
        statusFilter={statusFilter}
        onStatusChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        refundFilter={refundFilter}
        onRefundChange={(r) => {
          setRefundFilter(r);
          setPage(1);
        }}
        artisanFilter={artisanFilter}
        onArtisanChange={(a) => {
          setArtisanFilter(a);
          setPage(1);
        }}
        artisans={artisans}
        dateFilter={dateFilter}
        onDateChange={(d) => {
          setDateFilter(d);
          setPage(1);
        }}
        onReset={handleResetFilters}
        hasActiveFilter={hasActiveFilter}
      />

      {/* List / Table Pesanan */}
      {orders.length === 0 ? (
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
        <div className="space-y-4">
          <OrderTable orders={orders} />
          <PaginationBar
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      )}
    </div>
  );
}
