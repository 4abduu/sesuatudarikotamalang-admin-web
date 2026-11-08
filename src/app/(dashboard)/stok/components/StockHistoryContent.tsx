"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, History, Loader2, RefreshCw, Search } from "lucide-react";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDateTimeId, variantText } from "@/lib/format-operasional";
import {
  STOCK_REASON_LABEL,
  type StockMovement,
  type StockMovementsResponse,
  type StockReason,
} from "@/lib/types-operasional";

const PAGE_SIZE = 20;
const REASONS = Object.keys(STOCK_REASON_LABEL) as StockReason[];

export function StockHistoryContent() {
  const [reason, setReason] = useState<StockReason | "all">("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (reason !== "all") params.set("reason", reason);
      if (query) params.set("q", query);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const res = await apiFetch<StockMovementsResponse>(`/api/admin/stock/movements?${params.toString()}`);
      setMovements(res.movements || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat riwayat stok");
    } finally {
      setLoading(false);
    }
  }, [page, reason, query, from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applySearch() {
    setPage(1);
    setQuery(queryInput.trim());
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Cari nama produk"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            aria-label="Cari nama produk"
          />
          <Button type="button" variant="outline" className="gap-1.5" onClick={applySearch}>
            <Search className="h-4 w-4" />
            Cari
          </Button>
        </div>
        <Select
          value={reason}
          onValueChange={(v) => {
            setPage(1);
            setReason(v as StockReason | "all");
          }}
        >
          <SelectTrigger className="w-full lg:w-[200px]" aria-label="Filter alasan">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua alasan</SelectItem>
            {REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {STOCK_REASON_LABEL[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="lg:w-[160px]"
          value={from}
          onChange={(e) => {
            setPage(1);
            setFrom(e.target.value);
          }}
          aria-label="Dari tanggal"
        />
        <Input
          type="date"
          className="lg:w-[160px]"
          value={to}
          min={from || undefined}
          onChange={(e) => {
            setPage(1);
            setTo(e.target.value);
          }}
          aria-label="Sampai tanggal"
        />
      </div>

      {loading ? (
        <div className="grid min-h-[260px] place-items-center rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="grid min-h-[240px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-10 text-center">
          <div className="flex max-w-md flex-col items-center gap-3">
            <AlertTriangle className="h-9 w-9 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="gap-2" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : movements.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={History}
            title="Belum ada pergerakan stok"
            description="Penyesuaian stok dan pesanan akan tercatat di sini."
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Perubahan</TableHead>
                <TableHead className="text-right">Stok sesudah</TableHead>
                <TableHead>Alasan</TableHead>
                <TableHead>Oleh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDateTimeId(m.createdAt)}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{m.productName}</p>
                    <p className="text-xs text-muted-foreground">{variantText(m.variantLabel)}</p>
                  </TableCell>
                  <TableCell
                    className={`text-right font-semibold ${m.delta > 0 ? "text-accent" : "text-destructive"}`}
                  >
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </TableCell>
                  <TableCell className="text-right">{m.stockAfter}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STOCK_REASON_LABEL[m.reason] ?? m.reason}</Badge>
                    {m.orderNumber && <p className="mt-1 text-xs text-muted-foreground">{m.orderNumber}</p>}
                    {m.note && <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>}
                  </TableCell>
                  <TableCell className="text-sm">{m.actorName ?? "Sistem"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && !error && total > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages} ({total} catatan)
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Berikutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

