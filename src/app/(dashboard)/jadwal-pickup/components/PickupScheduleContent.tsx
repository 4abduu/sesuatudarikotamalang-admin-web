"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { ALL_HALF_HOURS, LEAD_OPTIONS, timeToMinutes } from "@/lib/format";
import type {
  ImpactInfo,
  PickupSchedule,
  PickupSettings,
  PickupSlot,
} from "@/lib/types";
import { ImpactDialog, SlotFormDialog } from "./SlotDialogs";

const SCHEDULE_URL = "/api/admin/pickup-schedule";
const SLOTS_URL = "/api/admin/pickup-slots";

type MutationResult = { message?: string };
/** ok = tersimpan; confirm = menunggu persetujuan dampak; error = ditolak server (dialog sumber tetap terbuka). */
type MutationOutcome = "ok" | "confirm" | "error";
type PendingConfirm = {
  slotTime: string;
  impact: ImpactInfo;
  retry: (confirm: boolean) => Promise<MutationResult>;
};

/**
 * Halaman Jadwal Pickup (admin): jam operasional, jeda pemesanan, dan slot pengambilan.
 * Setiap aksi pada slot langsung tersimpan ke server (tidak ada tombol "Simpan semua"); aksi yang berdampak
 * pada pesanan aktif meminta konfirmasi lewat respons 409 CONFIRMATION_REQUIRED dari backend.
 */
export function PickupScheduleContent() {
  const [schedule, setSchedule] = useState<PickupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<PickupSlot | null>(null);
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PickupSlot | null>(null);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch<PickupSchedule>(SCHEDULE_URL);
      setSchedule({ ...res, slots: [...res.slots].sort((a, b) => a.time.localeCompare(b.time)) });
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Gagal memuat jadwal pickup");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /**
   * Menjalankan perubahan. Percobaan pertama TANPA konfirmasi; bila backend menjawab 409 CONFIRMATION_REQUIRED,
   * dampaknya ditampilkan dan perubahan baru dikirim ulang dengan confirm=true setelah admin menyetujui.
   */
  async function runMutation(
    slotTime: string,
    request: (confirm: boolean) => Promise<MutationResult>
  ): Promise<MutationOutcome> {
    setBusy(true);
    try {
      const res = await request(false);
      toast.success(res.message || "Perubahan disimpan");
      await load(false);
      return "ok";
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === "CONFIRMATION_REQUIRED") {
        const impact = (err.data as { impact?: ImpactInfo } | undefined)?.impact;
        if (impact) {
          setPending({ slotTime, impact, retry: request });
          return "confirm";
        }
      }
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
      return "error";
    } finally {
      setBusy(false);
    }
  }

  async function confirmPending() {
    if (!pending) return;
    setBusy(true);
    try {
      const res = await pending.retry(true);
      toast.success(res.message || "Perubahan disimpan");
      setPending(null);
      await load(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  const slots = useMemo(() => schedule?.slots ?? [], [schedule]);
  const activeCount = slots.filter((s) => s.isActive).length;
  const isFallback = schedule?.source === "fallback";

  function handleFormSubmit(values: { time: string; capacity: number }) {
    if (formMode === "create") {
      void runMutation(values.time, (confirm) =>
        apiFetch<MutationResult>(SLOTS_URL, {
          method: "POST",
          body: JSON.stringify({ time: values.time, capacity: values.capacity, ...(confirm ? { confirm: true } : {}) }),
        })
      ).then((outcome) => {
        if (outcome === "ok") setFormMode(null); // bila ditolak server, dialog tetap terbuka agar bisa diperbaiki
      });
      return;
    }
    if (formMode === "edit" && editing?.id) {
      const target = editing;
      const changes: { time?: string; capacity?: number } = {};
      if (values.time !== target.time) changes.time = values.time;
      if (values.capacity !== target.capacity) changes.capacity = values.capacity;
      if (Object.keys(changes).length === 0) {
        setFormMode(null);
        return;
      }
      void runMutation(target.time, (confirm) =>
        apiFetch<MutationResult>(`${SLOTS_URL}/${target.id}`, {
          method: "PATCH",
          body: JSON.stringify({ ...changes, ...(confirm ? { confirm: true } : {}) }),
        })
      ).then((outcome) => {
        // ok: selesai. confirm: form ditutup dan dialog dampak yang tampil. error: form tetap terbuka.
        if (outcome !== "error") setFormMode(null);
        if (outcome === "ok") setEditing(null);
      });
    }
  }

  function handleToggle(slot: PickupSlot) {
    if (!slot.id) return;
    void runMutation(slot.time, (confirm) =>
      apiFetch<MutationResult>(`${SLOTS_URL}/${slot.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !slot.isActive, ...(confirm ? { confirm: true } : {}) }),
      })
    );
  }

  function handleDelete(slot: PickupSlot) {
    setDeleteTarget(null);
    if (!slot.id) return;
    void runMutation(slot.time, (confirm) =>
      apiFetch<MutationResult>(`${SLOTS_URL}/${slot.id}${confirm ? "?confirm=true" : ""}`, { method: "DELETE" })
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !schedule) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Jadwal pickup gagal dimuat</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{loadError || "Terjadi kesalahan tak terduga."}</p>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => void load()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const { settings, limits } = schedule;
  const atLimit = activeCount >= limits.maxActiveSlots;

  return (
    <div className="space-y-6">

      {isFallback && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Slot belum tersimpan di database</AlertTitle>
          <AlertDescription>
            Sistem sedang memakai nilai bawaan. Menambah slot pertama akan menyimpan seluruh nilai bawaan ke database
            terlebih dulu, lalu menambahkan slot barumu.
          </AlertDescription>
        </Alert>
      )}

      <HoursCard settings={settings} onSaved={() => load(false)} />

      <Card>
        <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="font-display text-base font-bold">Slot Pengambilan</CardTitle>
            <CardDescription>
              {activeCount} dari maksimal {limits.maxActiveSlots} slot aktif. Perubahan langsung tersimpan.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="gap-2"
            disabled={atLimit || busy}
            title={atLimit ? `Batas ${limits.maxActiveSlots} slot aktif tercapai. Nonaktifkan slot lain dulu.` : undefined}
            onClick={() => {
              setEditing(null);
              setFormMode("create");
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Slot
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {atLimit && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
              Batas {limits.maxActiveSlots} slot aktif tercapai. Nonaktifkan slot lain sebelum menambah atau mengaktifkan.
            </p>
          )}
          {activeCount === 0 && !isFallback && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Tidak ada slot aktif</AlertTitle>
              <AlertDescription>Pembeli tidak bisa membuat pesanan pickup sampai ada minimal satu slot aktif.</AlertDescription>
            </Alert>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jam</TableHead>
                  <TableHead>Kapasitas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pesanan aktif ke depan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => {
                  const readOnly = !slot.id;
                  const used = slot.usage.totalOrders > 0;
                  return (
                    <TableRow key={slot.id ?? slot.time} className={slot.isActive ? "" : "opacity-70"}>
                      <TableCell className="font-semibold">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {slot.time} WIB
                        </span>
                      </TableCell>
                      <TableCell>{slot.capacity} pesanan</TableCell>
                      <TableCell>
                        <Badge variant={slot.isActive ? "default" : "secondary"}>
                          {slot.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{slot.usage.upcomingActiveOrders}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            disabled={readOnly || busy}
                            onClick={() => {
                              setEditing(slot);
                              setFormMode("edit");
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Ubah
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={readOnly || busy || (!slot.isActive && atLimit)}
                            title={!slot.isActive && atLimit ? "Batas slot aktif tercapai" : undefined}
                            onClick={() => handleToggle(slot)}
                          >
                            {slot.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-destructive"
                            disabled={readOnly || busy || used}
                            title={used ? "Jam ini pernah dipakai pesanan. Nonaktifkan saja." : undefined}
                            onClick={() => setDeleteTarget(slot)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {slots.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      Belum ada slot. Klik Tambah Slot untuk membuat yang pertama.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="text-xs text-muted-foreground">
            Menonaktifkan slot hanya menyembunyikannya dari pembeli baru; pesanan yang sudah masuk tetap sah. Slot yang
            pernah dipakai pesanan tidak bisa dihapus atau diubah jamnya.
          </p>
        </CardContent>
      </Card>

      <SlotFormDialog
        open={formMode !== null}
        mode={formMode ?? "create"}
        slot={editing}
        settings={settings}
        limits={limits}
        existingTimes={slots.map((s) => s.time)}
        submitting={busy}
        onClose={() => setFormMode(null)}
        onSubmit={handleFormSubmit}
      />

      <ImpactDialog
        open={pending !== null}
        slotTime={pending?.slotTime ?? ""}
        impact={pending?.impact ?? null}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmPending()}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(next) => !next && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus slot {deleteTarget?.time} WIB?</AlertDialogTitle>
            <AlertDialogDescription>
              Slot dihapus permanen dan tidak bisa dikembalikan. Karena belum pernah dipakai pesanan apa pun, penghapusan
              ini tidak memengaruhi pesanan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && handleDelete(deleteTarget)}>Hapus Slot</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kartu jam operasional dan jeda pemesanan                            */
/* ------------------------------------------------------------------ */

function HoursCard({ settings, onSaved }: { settings: PickupSettings; onSaved: () => Promise<void> }) {
  const [openTime, setOpenTime] = useState(settings.openTime);
  const [closeTime, setCloseTime] = useState(settings.closeTime);
  const [lead, setLead] = useState(String(settings.leadMinutes));
  const [saving, setSaving] = useState(false);
  const [conflictSlots, setConflictSlots] = useState<string[] | null>(null);

  // Bergantung pada nilai (bukan objek) agar isian yang belum disimpan tidak tereset saat aksi slot memuat ulang data.
  useEffect(() => {
    setOpenTime(settings.openTime);
    setCloseTime(settings.closeTime);
    setLead(String(settings.leadMinutes));
  }, [settings.openTime, settings.closeTime, settings.leadMinutes]);

  const invalidRange = timeToMinutes(openTime) >= timeToMinutes(closeTime);
  const dirty =
    openTime !== settings.openTime || closeTime !== settings.closeTime || Number(lead) !== settings.leadMinutes;
  const leadOptions = LEAD_OPTIONS.includes(settings.leadMinutes)
    ? LEAD_OPTIONS
    : [...LEAD_OPTIONS, settings.leadMinutes].sort((a, b) => a - b);

  async function save() {
    if (invalidRange) return;
    setSaving(true);
    setConflictSlots(null);
    try {
      const res = await apiFetch<MutationResult>(`${SCHEDULE_URL}/settings`, {
        method: "PATCH",
        body: JSON.stringify({ openTime, closeTime, leadMinutes: Number(lead) }),
      });
      toast.success(res.message || "Jam operasional disimpan");
      await onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.code === "SLOTS_OUTSIDE_HOURS") {
        const list = (err.data as { slots?: string[] } | undefined)?.slots ?? [];
        setConflictSlots(list);
      }
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan jam operasional");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-base font-bold">Jam Operasional dan Jeda Pemesanan</CardTitle>
        <CardDescription>
          Slot pengambilan hanya boleh berada di antara jam buka dan jam tutup. Jeda menentukan berapa menit sebelum
          jam slot pemesanan ditutup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="open-time">Jam buka</Label>
            <Select value={openTime} onValueChange={setOpenTime} disabled={saving}>
              <SelectTrigger id="open-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_HALF_HOURS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} WIB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="close-time">Jam tutup</Label>
            <Select value={closeTime} onValueChange={setCloseTime} disabled={saving}>
              <SelectTrigger id="close-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_HALF_HOURS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} WIB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-minutes">Pemesanan ditutup sebelum slot</Label>
            <Select value={lead} onValueChange={setLead} disabled={saving}>
              <SelectTrigger id="lead-minutes">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leadOptions.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m === 0 ? "Tanpa jeda" : `${m} menit`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {invalidRange && (
          <p className="text-sm font-medium text-destructive">Jam buka harus lebih awal dari jam tutup.</p>
        )}

        {conflictSlots && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ada slot aktif di luar jam baru</AlertTitle>
            <AlertDescription>
              Slot berikut berada di luar jam operasional yang kamu pilih: <strong>{conflictSlots.join(", ")}</strong>.
              Nonaktifkan atau hapus slot itu dulu, lalu simpan ulang jam operasional.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={() => void save()} disabled={!dirty || invalidRange || saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Jam Operasional
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
