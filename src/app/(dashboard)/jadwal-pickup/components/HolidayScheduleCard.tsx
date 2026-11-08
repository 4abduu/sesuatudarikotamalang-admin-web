"use client";

import { useState } from "react";
import { CalendarDays, Loader2, X } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRangeId, inclusiveDays, todayWib } from "@/lib/format-operasional";
import type { HolidaySchedule } from "@/lib/types-operasional";

export type HolidayOutcome = "ok" | "confirm" | "error";

const MAX_RANGE_DAYS = 31;

/**
 * Card "Jadwal libur": form tambah (tanggal mulai, tanggal selesai opsional, alasan) dan daftar kartu jadwal
 * dengan tombol X + modal konfirmasi. Satu jadwal = satu tanggal atau beberapa tanggal BERURUTAN.
 */
export function HolidayScheduleCard({
  holidays,
  busy,
  onAdd,
  onRemove,
}: {
  holidays: HolidaySchedule[];
  busy: boolean;
  onAdd: (values: { startDate: string; endDate: string; reason: string }) => Promise<HolidayOutcome>;
  onRemove: (id: string) => Promise<void>;
}) {
  const today = todayWib();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<HolidaySchedule | null>(null);

  async function handleAdd() {
    const end = endDate || startDate;
    const cleanReason = reason.trim();
    if (!startDate) return setError("Pilih tanggal mulai libur.");
    if (startDate < today) return setError("Tanggal libur tidak boleh di masa lalu.");
    if (end < startDate) return setError("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    if (inclusiveDays(startDate, end) > MAX_RANGE_DAYS) {
      return setError(`Satu jadwal libur maksimal ${MAX_RANGE_DAYS} hari berurutan.`);
    }
    if (cleanReason.length < 3 || cleanReason.length > 120) {
      return setError("Alasan libur wajib diisi (3 sampai 120 karakter).");
    }
    setError(null);
    const outcome = await onAdd({ startDate, endDate: end, reason: cleanReason });
    if (outcome === "ok") {
      setStartDate("");
      setEndDate("");
      setReason("");
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <CalendarDays className="h-4 w-4" />
          </span>
          Jadwal Libur
        </CardTitle>
        <CardDescription>
          Tutup pickup pada tanggal tertentu. Satu jadwal hanya untuk tanggal yang berurutan. Misalnya libur tanggal
          7, 8, 9 cukup satu jadwal, tetapi libur tanggal 7, 9, 10 dibuat dua jadwal: tanggal 7, lalu tanggal 9
          sampai 10.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="holiday-start">Tanggal mulai</Label>
            <Input
              id="holiday-start"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value && endDate < e.target.value) setEndDate("");
              }}
              disabled={busy}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="holiday-end">Tanggal selesai (kosongkan bila satu hari)</Label>
            <Input
              id="holiday-end"
              type="date"
              min={startDate || today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="holiday-reason">Alasan libur</Label>
          <Input
            id="holiday-reason"
            maxLength={120}
            placeholder="Contoh: Libur Maulid Nabi, renovasi toko, stok opname"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
          />
        </div>
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <div className="flex justify-end">
          <Button type="button" onClick={() => void handleAdd()} disabled={busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tambah Jadwal Libur
          </Button>
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-semibold text-foreground">Jadwal libur yang akan datang</p>
          {holidays.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
              Belum ada jadwal libur.
            </p>
          ) : (
            <ul className="space-y-2">
              {holidays.map((h) => (
                <li
                  key={h.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{formatRangeId(h.startDate, h.endDate)}</p>
                    <p className="text-sm text-muted-foreground">{h.reason}</p>
                    {(h.affectedOrders ?? 0) > 0 && (
                      <Badge variant="secondary">{h.affectedOrders} pesanan terdampak</Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Batalkan jadwal libur ${formatRangeId(h.startDate, h.endDate)}`}
                    disabled={busy}
                    onClick={() => setRemoveTarget(h)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <AlertDialog open={removeTarget !== null} onOpenChange={(next) => !next && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan jadwal libur ini?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget ? `${formatRangeId(removeTarget.startDate, removeTarget.endDate)} (${removeTarget.reason}). ` : ""}
              Setelah dibatalkan, tanggal itu kembali bisa dipilih pembeli, dan tanda Terdampak libur pada pesanan
              yang terkait ikut hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tidak</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeTarget) void onRemove(removeTarget.id);
                setRemoveTarget(null);
              }}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

