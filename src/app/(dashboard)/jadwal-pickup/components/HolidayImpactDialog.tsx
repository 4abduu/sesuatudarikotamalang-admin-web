"use client";

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
import { formatDateId } from "@/lib/format";
import type { HolidayImpact } from "@/lib/types-operasional";

/** Dialog konfirmasi saat libur baru mengenai pesanan yang sudah ada (respons 409 CONFIRMATION_REQUIRED). */
export function HolidayImpactDialog({
  open,
  title,
  impact,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  impact: HolidayImpact | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Ada <strong className="text-foreground">{impact?.affectedOrders ?? 0} pesanan aktif</strong> dengan
                jadwal pickup di tanggal yang akan libur.
              </p>
              {impact && impact.dates.length > 0 && (
                <ul className="list-inside list-disc space-y-0.5">
                  {impact.dates.map((d) => (
                    <li key={d.date}>
                      {formatDateId(d.date)}: {d.count} pesanan
                    </li>
                  ))}
                </ul>
              )}
              <p>
                Pesanan tidak dibatalkan otomatis. Pesanan itu ditandai <strong>Terdampak libur</strong> dan bisa
                diambil kapan saja saat toko buka. Hubungi pembeli lewat WhatsApp. Kalau pembeli ingin batal, admin
                membatalkannya manual.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
          <AlertDialogAction disabled={busy} onClick={onConfirm}>
            Tetap Simpan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

