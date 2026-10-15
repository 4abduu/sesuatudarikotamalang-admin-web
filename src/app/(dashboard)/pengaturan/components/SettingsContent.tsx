"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { AppSettings } from "@/lib/types";

import { ReservationSettingsCard } from "./ReservationSettingsCard";
import { PickupDeadlineCard } from "./PickupDeadlineCard";
import { ContactSettingsCard } from "./ContactSettingsCard";

export function SettingsContent() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [holdMinutes, setHoldMinutes] = useState(120);
  const [autoCancel, setAutoCancel] = useState(true);
  const [deadlineDays, setDeadlineDays] = useState(14);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ settings: AppSettings }>("/api/admin/settings");
      if (res.settings) {
        setSettings(res.settings);
        setHoldMinutes(res.settings.holdDurationMinutes || 120);
        setAutoCancel(res.settings.autoCancelEnabled ?? true);
        setDeadlineDays(res.settings.pickupDeadlineDays || 14);
        setWhatsappNumber(res.settings.whatsappAdminNumber || "");
        setNotificationEmail(res.settings.notificationEmail || "");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Gagal memuat pengaturan toko dari server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Simpan perubahan ke backend (PUT /api/admin/settings)
  const saveAllSettings = async () => {
    // Validasi klien
    if (holdMinutes < 15 || holdMinutes > 1440) {
      toast.error("Durasi hold harus antara 15 sampai 1440 menit");
      return;
    }
    if (![7, 14, 30].includes(deadlineDays)) {
      toast.error("Batas pengambilan harus 7, 14, atau 30 hari");
      return;
    }
    if (whatsappNumber && !/^\+?\d+$/.test(whatsappNumber)) {
      toast.error("Nomor WhatsApp hanya boleh berupa angka (boleh diawali tanda +)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        holdDurationMinutes: holdMinutes,
        autoCancelEnabled: autoCancel,
        pickupDeadlineDays: deadlineDays,
        whatsappAdminNumber: whatsappNumber.trim(),
        notificationEmail: notificationEmail.trim(),
      };

      const res = await apiFetch<{ message: string; settings: AppSettings }>(
        "/api/admin/settings",
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      setSettings(res.settings);
      toast.success(res.message || "Pengaturan sistem berhasil disimpan");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menyimpan pengaturan ke server");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[350px] place-items-center rounded-xl border border-border bg-card p-12">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat pengaturan sistem…</p>
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
        <div className="flex flex-col items-center gap-4 max-w-md">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h3 className="text-base font-bold text-foreground">Gagal Memuat Pengaturan</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          </div>
          <Button onClick={fetchSettings} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 1. Pengaturan Reservasi & Hold Stok */}
      <ReservationSettingsCard
        holdMinutes={holdMinutes}
        onHoldMinutesChange={setHoldMinutes}
        autoCancel={autoCancel}
        onAutoCancelChange={setAutoCancel}
        onSave={saveAllSettings}
        loading={saving}
      />

      {/* 2. Pengaturan Batas Hari Pengambilan */}
      <PickupDeadlineCard
        deadlineDays={deadlineDays}
        onDeadlineChange={setDeadlineDays}
        onSave={saveAllSettings}
        loading={saving}
      />

      {/* 3. Pengaturan Kontak & Email Notifikasi */}
      <ContactSettingsCard
        whatsappNumber={whatsappNumber}
        onWhatsappChange={setWhatsappNumber}
        notificationEmail={notificationEmail}
        onEmailChange={setNotificationEmail}
        onSave={saveAllSettings}
        loading={saving}
      />
    </div>
  );
}
