"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildTimeOptions, formatDateId } from "@/lib/format";
import type { ImpactInfo, PickupLimits, PickupSettings, PickupSlot } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Dialog tambah / ubah slot                                           */
/* ------------------------------------------------------------------ */

export function SlotFormDialog({
  open,
  mode,
  slot,
  settings,
  limits,
  existingTimes,
  submitting,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  slot: PickupSlot | null;
  settings: PickupSettings;
  limits: PickupLimits;
  /** Semua jam yang sudah ada di database (aktif maupun nonaktif). */
  existingTimes: string[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: { time: string; capacity: number }) => void;
}) {
  const [time, setTime] = useState("");
  const [capacityText, setCapacityText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Isi ulang form setiap dialog dibuka.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setTime(mode === "edit" && slot ? slot.time : "");
    setCapacityText(mode === "edit" && slot ? String(slot.capacity) : "3");
  }, [open, mode, slot]);

  const timeLocked = mode === "edit" && !!slot && slot.usage.totalOrders > 0;

  const timeOptions = useMemo(() => {
    const all = buildTimeOptions(settings.openTime, settings.closeTime, limits.stepMinutes);
    const taken = new Set(existingTimes);
    // Saat edit, jam milik slot ini sendiri tetap boleh dipilih.
    return all.filter((t) => !taken.has(t) || (mode === "edit" && slot?.time === t));
  }, [settings.openTime, settings.closeTime, limits.stepMinutes, existingTimes, mode, slot]);

  function handleSubmit() {
    const capacity = Number(capacityText);
    if (!time) return setError("Pilih jam pengambilan.");
    if (!Number.isInteger(capacity) || capacity < limits.minCapacity || capacity > limits.maxCapacity) {
      return setError(`Kapasitas harus bilangan bulat ${limits.minCapacity} sampai ${limits.maxCapacity}.`);
    }
    setError(null);
    onSubmit({ time, capacity });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Slot Pengambilan" : "Ubah Slot Pengambilan"}</DialogTitle>
          <DialogDescription>
            Jam harus kelipatan {limits.stepMinutes} menit dan berada dalam jam operasional ({settings.openTime} sampai{" "}
            {settings.closeTime}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="slot-time">Jam pengambilan</Label>
            <Select value={time} onValueChange={setTime} disabled={timeLocked || submitting}>
              <SelectTrigger id="slot-time">
                <SelectValue placeholder="Pilih jam" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} WIB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {timeLocked && (
              <p className="text-xs text-muted-foreground">
                Jam ini pernah dipakai {slot?.usage.totalOrders} pesanan sehingga tidak bisa diubah. Nonaktifkan jam ini
                lalu tambahkan jam baru.
              </p>
            )}
            {mode === "create" && timeOptions.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Semua jam dalam jam operasional sudah ada. Ubah jam operasional atau aktifkan kembali slot yang nonaktif.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slot-capacity">Kapasitas (jumlah pesanan per tanggal)</Label>
            <Input
              id="slot-capacity"
              type="number"
              inputMode="numeric"
              min={limits.minCapacity}
              max={limits.maxCapacity}
              value={capacityText}
              onChange={(e) => setCapacityText(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Tambah Slot" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog peringatan dampak (respons 409 CONFIRMATION_REQUIRED)         */
/* ------------------------------------------------------------------ */

export function ImpactDialog({
  open,
  slotTime,
  impact,
  busy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  slotTime: string;
  impact: ImpactInfo | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const title =
    impact?.type === "CAPACITY_BELOW_BOOKED"
      ? "Kapasitas lebih kecil dari pesanan yang sudah ada"
      : impact?.type === "DELETE"
        ? "Hapus slot terakhir yang aktif?"
        : "Nonaktifkan slot yang masih dipakai?";

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              {impact && impact.upcomingActiveOrders > 0 && impact.type !== "CAPACITY_BELOW_BOOKED" && (
                <p>
                  Slot <strong>{slotTime} WIB</strong> masih punya <strong>{impact.upcomingActiveOrders} pesanan aktif</strong>{" "}
                  untuk hari ini atau ke depan. Pesanan itu <strong>tetap sah dan tetap harus dilayani</strong>; yang
                  berubah hanya pembeli baru tidak bisa memilih jam ini lagi.
                </p>
              )}
              {impact?.type === "CAPACITY_BELOW_BOOKED" && (
                <p>
                  Kapasitas baru <strong>{impact.newCapacity}</strong> lebih kecil dari jumlah pesanan yang sudah masuk
                  pada tanggal berikut. Pesanan lama tetap sah; pembeli baru tidak bisa memesan di tanggal itu sampai ada
                  ruang.
                </p>
              )}
              {impact && impact.dates.length > 0 && (
                <ul className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border bg-muted/40 p-3">
                  {impact.dates.map((d) => (
                    <li key={d.date} className="flex justify-between gap-4">
                      <span>{formatDateId(d.date)}</span>
                      <span className="font-semibold">{d.booked} pesanan</span>
                    </li>
                  ))}
                </ul>
              )}
              {impact?.lastActiveSlot && (
                <p className="font-medium text-amber-700 dark:text-amber-300">
                  Ini slot aktif terakhir. Setelah ini pembeli tidak bisa membuat pesanan pickup sama sekali sampai ada
                  slot aktif lagi.
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(e) => {
              e.preventDefault(); // dialog ditutup oleh induk setelah request selesai
              onConfirm();
            }}
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tetap Lanjutkan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
