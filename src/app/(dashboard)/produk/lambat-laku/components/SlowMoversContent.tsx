"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Hourglass, Loader2, RefreshCw } from "lucide-react";
import { EmptyState } from "@/app/(dashboard)/components/admin-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDateId, formatRupiah } from "@/lib/format";
import type { SlowMoverProduct, SlowMoversResponse } from "@/lib/types-operasional";
import { ProductActionReasonDialog } from "../../components/ProductActionReasonDialog";

type LevelFilter = "all" | "peringatan" | "tarik";

function idleText(p: SlowMoverProduct): string {
  const months = Math.floor(p.daysIdle / 30);
  const days = p.daysIdle % 30;
  if (months <= 0) return `${p.daysIdle} hari`;
  return days > 0 ? `${months} bulan ${days} hari` : `${months} bulan`;
}

export function SlowMoversContent() {
  const [data, setData] = useState<SlowMoversResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState<LevelFilter>("all");
  const [withdrawTarget, setWithdrawTarget] = useState<SlowMoverProduct | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiFetch<SlowMoversResponse>("/api/admin/products/slow-movers"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat produk lambat laku");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = useMemo(() => {
    const list = data?.products ?? [];
    return level === "all" ? list : list.filter((p) => p.level === level);
  }, [data, level]);

  if (loading) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Berdasarkan penjualan lewat aplikasi saja</AlertTitle>
        <AlertDescription>
          Penjualan di kasir tidak tercatat di aplikasi, jadi produk yang laku di kasir bisa tampak tidak laku. Cek stok
          fisik dulu sebelum menarik produk. Penarikan dilakukan manual oleh admin.
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-3">
        <Select value={level} onValueChange={(v) => setLevel(v as LevelFilter)}>
          <SelectTrigger className="w-[220px]" aria-label="Filter tingkat">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="peringatan">Peringatan (bulan ke-{data.warnMonths})</SelectItem>
            <SelectItem value="tarik">Siap ditarik ({data.withdrawMonths} bulan)</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{rows.length} produk</span>
      </div>

      {rows.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={Hourglass}
            title="Tidak ada produk lambat laku"
            description="Semua produk aktif masih dalam batas waktu penjualan."
          />
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Kreator</TableHead>
                <TableHead>Acuan hitungan</TableHead>
                <TableHead>Lama tidak laku</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Tingkat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatRupiah(p.price)}</p>
                  </TableCell>
                  <TableCell>{p.artisan.brandName}</TableCell>
                  <TableCell className="text-sm">
                    <p>{p.referenceType === "ditambahkan" ? "Ditambahkan" : "Terjual terakhir"}</p>
                    <p className="text-xs text-muted-foreground">{formatDateId(p.referenceDate.slice(0, 10))}</p>
                  </TableCell>
                  <TableCell>{idleText(p)}</TableCell>
                  <TableCell>{p.totalStock}</TableCell>
                  <TableCell>
                    <Badge variant={p.level === "tarik" ? "destructive" : "secondary"}>
                      {p.level === "tarik" ? "Siap ditarik" : "Peringatan"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => setWithdrawTarget(p)}
                    >
                      Tarik Produk
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductActionReasonDialog
        open={withdrawTarget !== null}
        mode="withdraw"
        productId={withdrawTarget?.id ?? null}
        productName={withdrawTarget?.name ?? ""}
        onClose={() => setWithdrawTarget(null)}
        onDone={() => {
          setWithdrawTarget(null);
          void load();
        }}
      />
    </div>
  );
}

