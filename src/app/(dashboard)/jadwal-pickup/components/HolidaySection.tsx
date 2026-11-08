"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import type { HolidayImpact, PickupHolidaysResponse, WeeklyOff } from "@/lib/types-operasional";
import { HolidayImpactDialog } from "./HolidayImpactDialog";
import { HolidayScheduleCard, type HolidayOutcome } from "./HolidayScheduleCard";
import { WeeklyOffCard } from "./WeeklyOffCard";

const HOLIDAYS_URL = "/api/admin/pickup-holidays";

type MutationResult = { message?: string };
type PendingConfirm = {
  title: string;
  impact: HolidayImpact;
  retry: () => Promise<MutationResult>;
};

/**
 * Bagian "libur" pada halaman Jadwal Pickup: libur mingguan (saklar + 1 sampai 3 hari) dan jadwal libur per
 * tanggal. Pola konfirmasi dampak sama dengan slot: percobaan pertama tanpa confirm, bila backend menjawab
 * 409 CONFIRMATION_REQUIRED dampaknya ditampilkan lalu dikirim ulang dengan confirm=true.
 */
export function HolidaySection() {
  const [data, setData] = useState<PickupHolidaysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const [formKey, setFormKey] = useState(0);

  const load = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetch<PickupHolidaysResponse>(HOLIDAYS_URL);
      setData(res);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Gagal memuat jadwal libur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runMutation(
    title: string,
    request: (confirm: boolean) => Promise<MutationResult>
  ): Promise<HolidayOutcome> {
    setBusy(true);
    try {
      const res = await request(false);
      toast.success(res.message || "Perubahan disimpan");
      await load(false);
      return "ok";
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === "CONFIRMATION_REQUIRED") {
        const impact = (err.data as { impact?: HolidayImpact } | undefined)?.impact;
        if (impact) {
          setPending({ title, impact, retry: () => request(true) });
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
      const res = await pending.retry();
      toast.success(res.message || "Perubahan disimpan");
      setPending(null);
      setFormKey((k) => k + 1); // kosongkan form setelah jadwal tersimpan
      await load(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan");
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  function saveWeekly(next: WeeklyOff) {
    void runMutation("Simpan libur mingguan?", (confirm) =>
      apiFetch<MutationResult>(`${HOLIDAYS_URL}/weekly`, {
        method: "PUT",
        body: JSON.stringify({ ...next, ...(confirm ? { confirm: true } : {}) }),
      })
    );
  }

  function addHoliday(values: { startDate: string; endDate: string; reason: string }) {
    return runMutation("Simpan jadwal libur?", (confirm) =>
      apiFetch<MutationResult>(HOLIDAYS_URL, {
        method: "POST",
        body: JSON.stringify({ ...values, ...(confirm ? { confirm: true } : {}) }),
      })
    );
  }

  async function removeHoliday(id: string) {
    setBusy(true);
    try {
      const res = await apiFetch<MutationResult>(`${HOLIDAYS_URL}/${id}`, { method: "DELETE" });
      toast.success(res.message || "Jadwal libur dibatalkan");
      await load(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membatalkan jadwal libur");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Jadwal libur gagal dimuat</AlertTitle>
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

  return (
    <div className="space-y-6">
      <WeeklyOffCard weeklyOff={data.weeklyOff} busy={busy} onSave={saveWeekly} />
      <HolidayScheduleCard
        key={formKey}
        holidays={data.holidays}
        busy={busy}
        onAdd={addHoliday}
        onRemove={removeHoliday}
      />
      <HolidayImpactDialog
        open={pending !== null}
        title={pending?.title ?? ""}
        impact={pending?.impact ?? null}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void confirmPending()}
      />
    </div>
  );
}

