"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WEEKDAY_OPTIONS } from "@/lib/format-operasional";
import type { WeeklyOff } from "@/lib/types-operasional";

const MAX_DAYS = 3;

/**
 * Card "Hari libur mingguan": saklar aktif/nonaktif + pilihan 1 sampai 3 hari.
 * Nonaktif = tidak ada libur mingguan. Aktif = wajib minimal 1 dan maksimal 3 hari.
 */
export function WeeklyOffCard({
  weeklyOff,
  busy,
  onSave,
}: {
  weeklyOff: WeeklyOff;
  busy: boolean;
  onSave: (next: WeeklyOff) => void;
}) {
  const [enabled, setEnabled] = useState(weeklyOff.enabled);
  const [days, setDays] = useState<number[]>(weeklyOff.days);

  // Sinkron dengan data server setelah dimuat ulang (bergantung pada nilai, bukan objek).
  const serverKey = `${weeklyOff.enabled}|${weeklyOff.days.join(",")}`;
  useEffect(() => {
    setEnabled(weeklyOff.enabled);
    setDays(weeklyOff.days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

  const sortedDays = [...days].sort((a, b) => a - b);
  const dirty =
    enabled !== weeklyOff.enabled ||
    (enabled && sortedDays.join(",") !== [...weeklyOff.days].sort((a, b) => a - b).join(","));
  const invalid = enabled && (sortedDays.length < 1 || sortedDays.length > MAX_DAYS);
  const atMax = enabled && sortedDays.length >= MAX_DAYS;

  function toggleDay(n: number) {
    setDays((prev) => {
      if (prev.includes(n)) return prev.filter((d) => d !== n);
      if (prev.length >= MAX_DAYS) return prev;
      return [...prev, n];
    });
  }

  function handleSave() {
    if (invalid) return;
    onSave({ enabled, days: enabled ? sortedDays : weeklyOff.days });
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive">
            <CalendarOff className="h-4 w-4" />
          </span>
          Hari Libur Mingguan
        </CardTitle>
        <CardDescription>
          Hari yang dipilih tampil merah dan tidak bisa dipilih pembeli di tanggal pickup. Maksimal {MAX_DAYS} hari.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <div>
            <Label htmlFor="weekly-off-switch" className="text-sm font-semibold">
              Aktifkan libur mingguan
            </Label>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Pilih minimal 1 dan maksimal 3 hari." : "Nonaktif: toko tidak punya hari libur tetap."}
            </p>
          </div>
          <Switch id="weekly-off-switch" checked={enabled} onCheckedChange={setEnabled} disabled={busy} />
        </div>

        <div className={enabled ? "" : "pointer-events-none opacity-50"} aria-disabled={!enabled}>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_OPTIONS.map((d) => {
              const selected = days.includes(d.value);
              return (
                <Button
                  key={d.value}
                  type="button"
                  size="sm"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  disabled={busy || !enabled || (!selected && atMax)}
                  onClick={() => toggleDay(d.value)}
                >
                  {d.label}
                </Button>
              );
            })}
          </div>
          {enabled && (
            <p className="mt-2 text-xs text-muted-foreground">
              Terpilih {sortedDays.length} dari maksimal {MAX_DAYS} hari.
            </p>
          )}
        </div>

        {invalid && (
          <p className="text-sm font-medium text-destructive">
            Pilih minimal 1 hari, atau nonaktifkan libur mingguan.
          </p>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={!dirty || invalid || busy}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Libur Mingguan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

