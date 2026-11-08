"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { formatMonthId, formatPercent, variantText } from "@/lib/format-operasional";
import type { CreatorMonthlyReport } from "@/lib/types-operasional";
import { printCreatorReport } from "./print-report";

/** Detail laporan satu kreator: ringkasan, daftar penjualan, dan sisa stok. */
export function CreatorReportDetail({
  open,
  month,
  status,
  report,
  onClose,
}: {
  open: boolean;
  month: string;
  status: "draf" | "final";
  report: CreatorMonthlyReport | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {report?.brandName} · {formatMonthId(month)}
          </DialogTitle>
          <DialogDescription>
            {status === "final" ? "Laporan final." : "Laporan masih draf dan memakai persentase terbaru."} Hanya
            penjualan lewat aplikasi.
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <Summary label="Barang terjual" value={`${report.itemsSold} pcs`} />
              <Summary label="Omzet" value={formatRupiah(report.revenue)} />
              <Summary
                label={`Bagian kreator (${formatPercent(report.sharePercent)})`}
                value={formatRupiah(report.creatorShare)}
              />
              <Summary label="Bagian toko" value={formatRupiah(report.storeShare)} />
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Penjualan</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Omzet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.sales.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Tidak ada penjualan pada bulan ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.sales.map((s, i) => (
                        <TableRow key={`${s.productId}-${s.variantLabel ?? ""}-${s.price}-${i}`}>
                          <TableCell>
                            <p className="font-medium">{s.productName}</p>
                            <p className="text-xs text-muted-foreground">{variantText(s.variantLabel)}</p>
                          </TableCell>
                          <TableCell className="text-right">{s.quantity}</TableCell>
                          <TableCell className="text-right">{formatRupiah(s.price)}</TableCell>
                          <TableCell className="text-right">{formatRupiah(s.revenue)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Sisa stok</h3>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-right">Stok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.stock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                          Tidak ada data stok.
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.stock.map((s, i) => (
                        <TableRow key={`${s.productId}-${s.variantLabel ?? ""}-${i}`}>
                          <TableCell>
                            <p className="font-medium">{s.productName}</p>
                            <p className="text-xs text-muted-foreground">{variantText(s.variantLabel)}</p>
                          </TableCell>
                          <TableCell className="text-right">{s.stock}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button type="button" className="gap-2" disabled={!report} onClick={() => report && printCreatorReport(month, status, report)}>
            <Printer className="h-4 w-4" />
            Cetak atau Simpan PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

