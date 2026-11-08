"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, FileBarChart, Loader2, Lock, LockOpen, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, StatCard } from "@/app/(dashboard)/components/admin-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { currentMonthWib, formatDateTimeId, formatMonthId, formatPercent } from "@/lib/format-operasional";
import type { CreatorMonthlyReport, MonthlyReport } from "@/lib/types-operasional";
import { CreatorReportDetail } from "./CreatorReportDetail";
import { printCreatorReport } from "./print-report";

type Confirm = "finalize" | "reopen" | null;

function previousMonthWib(): string {
  const [y, m] = currentMonthWib().split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function MonthlyReportContent() {
  const thisMonth = currentMonthWib();
  const [month, setMonth] = useState(previousMonthWib());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [detail, setDetail] = useState<CreatorMonthlyReport | null>(null);

  const load = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);
    try {
      setReport(await apiFetch<MonthlyReport>(`/api/admin/reports/monthly?month=${month}`));
    } catch (err) {
      setReport(null);
      setError(err instanceof ApiError ? err.message : "Gagal memuat laporan bulanan");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthEnded = month < thisMonth;

  async function runAction(kind: "finalize" | "reopen") {
    setBusy(true);
    try {
      const res = await apiFetch<{ message?: string; report?: MonthlyReport }>(
        `/api/admin/reports/monthly/${month}/${kind}`,
        { method: "POST", body: JSON.stringify({}) }
      );
      toast.success(res.message || (kind === "finalize" ? "Laporan difinalkan" : "Laporan dibuka kembali"));
      if (res.report) setReport(res.report);
      else await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Aksi gagal diproses");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Input
            type="month"
            className="w-[200px]"
            value={month}
            max={thisMonth}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Pilih bulan laporan"
          />
          {report && (
            <Badge variant={report.status === "final" ? "default" : "secondary"}>
              {report.status === "final" ? "Final" : "Draf"}
            </Badge>
          )}
        </div>
        {report && (
          <div className="flex flex-wrap gap-2">
            {report.status === "draf" ? (
              <Button
                type="button"
                className="gap-2"
                disabled={busy || !monthEnded}
                title={monthEnded ? undefined : "Bulan berjalan belum bisa difinalkan"}
                onClick={() => setConfirm("finalize")}
              >
                <Lock className="h-4 w-4" />
                Finalkan Laporan
              </Button>
            ) : (
              <Button type="button" variant="outline" className="gap-2" disabled={busy} onClick={() => setConfirm("reopen")}>
                <LockOpen className="h-4 w-4" />
                Buka Kembali
              </Button>
            )}
          </div>
        )}
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Hanya penjualan lewat aplikasi</AlertTitle>
        <AlertDescription>
          Penjualan di kasir tidak masuk laporan. Laporan draf memakai persentase bagi hasil terbaru; setelah
          difinalkan, angkanya tersimpan dan tidak berubah lagi. Kreator hanya melihat laporan yang sudah final.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="grid min-h-[260px] place-items-center rounded-xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error || !report ? (
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
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Barang terjual" value={`${report.totals.itemsSold} pcs`} icon={FileBarChart} accent="brown" />
            <StatCard label="Omzet" value={formatRupiah(report.totals.revenue)} icon={FileBarChart} />
            <StatCard label="Bagian kreator" value={formatRupiah(report.totals.creatorShare)} icon={FileBarChart} accent="accent" />
            <StatCard label="Bagian toko" value={formatRupiah(report.totals.storeShare)} icon={FileBarChart} accent="mustard" />
          </div>
          {report.status === "final" && report.finalizedAt && (
            <p className="text-xs text-muted-foreground">Difinalkan {formatDateTimeId(report.finalizedAt)}.</p>
          )}

          {report.creators.length === 0 ? (
            <Card className="p-0">
              <EmptyState
                icon={FileBarChart}
                title="Tidak ada data"
                description={`Belum ada penjualan atau kreator aktif untuk ${formatMonthId(month)}.`}
              />
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kreator</TableHead>
                    <TableHead className="text-right">Terjual</TableHead>
                    <TableHead className="text-right">Omzet</TableHead>
                    <TableHead className="text-right">Persen kreator</TableHead>
                    <TableHead className="text-right">Bagian kreator</TableHead>
                    <TableHead className="text-right">Bagian toko</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.creators.map((c) => (
                    <TableRow key={c.artisanId}>
                      <TableCell className="font-semibold">{c.brandName}</TableCell>
                      <TableCell className="text-right">{c.itemsSold}</TableCell>
                      <TableCell className="text-right">{formatRupiah(c.revenue)}</TableCell>
                      <TableCell className="text-right">{formatPercent(c.sharePercent)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(c.creatorShare)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(c.storeShare)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => setDetail(c)}>
                            Detail
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => printCreatorReport(report.month, report.status, c)}
                          >
                            <Printer className="h-3.5 w-3.5" />
                            Cetak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <CreatorReportDetail
        open={detail !== null}
        month={month}
        status={report?.status ?? "draf"}
        report={detail}
        onClose={() => setDetail(null)}
      />

      <AlertDialog open={confirm !== null} onOpenChange={(next) => !next && !busy && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "finalize" ? `Finalkan laporan ${formatMonthId(month)}?` : `Buka kembali laporan ${formatMonthId(month)}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "finalize"
                ? "Omzet, persentase, dan bagian tiap kreator disimpan dan tidak berubah lagi walau persentase diganti. Kreator bisa melihat laporannya."
                : "Laporan kembali berstatus draf dan disembunyikan dari kreator sampai difinalkan lagi. Angkanya dihitung ulang dengan persentase terbaru."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                if (confirm) void runAction(confirm);
              }}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirm === "finalize" ? "Finalkan" : "Buka Kembali"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

