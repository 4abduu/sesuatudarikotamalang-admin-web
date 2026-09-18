"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  Mail,
  Phone,
  Save,
  Send,
  ShieldAlert,
  Store,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminSettings } from "@/lib/admin-settings";

const PICKUP_DEADLINE_OPTIONS = [7, 14, 30] as const;

/**
 * Pengaturan Sistem page BODY — admin system settings (reservation/hold,
 * pickup deadline, contact, store display).
 *
 * Extracted from `pengaturan/page.tsx` so the same body can be rendered
 * inside the export-figma combo page (without AdminShell). The original
 * page's "use client" + useAdminSettings (zustand) behavior is preserved
 * — for the export combo page, the persisted store rehydrates normally
 * so all inputs render with sensible defaults.
 */
export function AdminPengaturanContent() {
  // Pull initial values from the persisted admin-settings store so the UI
  // reflects whatever was saved last (and survives refreshes).
  const settings = useAdminSettings((s) => s.settings);
  const update = useAdminSettings((s) => s.update);

  // Reservasi & Stok — local drafts the Simpan button commits to the store.
  const [holdMinutes, setHoldMinutes] = useState<number>(
    settings.holdDurationMinutes,
  );
  const [autoCancel, setAutoCancel] = useState<boolean>(settings.autoCancelCash);
  const [slotLimit, setSlotLimit] = useState<number>(3);
  const [pickupDeadlineDays, setPickupDeadlineDays] = useState<number>(
    settings.pickupDeadlineDays,
  );

  // Kontak & Notifikasi
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    settings.whatsappAdmin,
  );
  const [orderEmail, setOrderEmail] = useState<string>(settings.emailNotif);
  const [telegramNotif, setTelegramNotif] = useState(false);

  // Tampilan Toko
  const [showCreatorBanner, setShowCreatorBanner] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const clampHold = (value: number) =>
    Number.isNaN(value) ? "" : Math.min(120, Math.max(0, value));

  const clampSlot = (value: number) =>
    Number.isNaN(value) ? "" : Math.min(20, Math.max(0, value));

  const saveReservation = () => {
    if (holdMinutes < 5 || holdMinutes > 120) {
      toast.error("Durasi hold harus antara 5–120 menit.", {
        description: "Periksa kembali isian Durasi Hold Stok.",
      });
      return;
    }
    if (slotLimit < 1) {
      toast.error("Limit slot minimal 1.", {
        description: "Atur minimal satu reservasi per slot jam.",
      });
      return;
    }
    if (!PICKUP_DEADLINE_OPTIONS.includes(pickupDeadlineDays as 7 | 14 | 30)) {
      toast.error("Batas pengambilan tidak valid.", {
        description: "Pilih salah satu: 7, 14, atau 30 hari.",
      });
      return;
    }
    // Persist all reservation-related settings to the store.
    update({
      holdDurationMinutes: holdMinutes,
      autoCancelCash: autoCancel,
      pickupDeadlineDays,
    });
    toast.success("Pengaturan disimpan", {
      description: `Hold ${holdMinutes} menit · Batas pengambilan ${pickupDeadlineDays} hari · Auto-cancel ${autoCancel ? "aktif" : "nonaktif"}.`,
    });
  };

  const saveContact = () => {
    if (!/^\d{8,15}$/.test(whatsappNumber)) {
      toast.error("Nomor WhatsApp tidak valid.", {
        description: "Format internasional tanpa +, contoh: 6281234567890.",
      });
      return;
    }
    if (!orderEmail.includes("@")) {
      toast.error("Email notifikasi tidak valid.", {
        description: "Periksa kembali alamat email pesanan baru.",
      });
      return;
    }
    update({ whatsappAdmin: whatsappNumber, emailNotif: orderEmail });
    toast.success("Kontak & notifikasi disimpan", {
      description: `WhatsApp ${whatsappNumber} · Email ${orderEmail}.`,
    });
  };

  const saveDisplay = () => {
    toast.success("Tampilan toko disimpan", {
      description: maintenanceMode
        ? "Mode maintenance AKTIF — toko sementara ditutup."
        : "Toko tayang normal.",
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Pengaturan Sistem"
        description="Konfigurasi operasional toko & reservasi."
      />

      {maintenanceMode && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#B5502F]/40 bg-[#B5502F]/10 px-4 py-2.5 text-sm text-[#8a3a22]">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            <strong className="font-semibold">Mode maintenance sedang AKTIF.</strong>{" "}
            Pengunjung akan melihat halaman penutupan sementara.
          </span>
        </div>
      )}

      {/* Reservasi & Stok */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </span>
            Reservasi & Stok
          </CardTitle>
          <CardDescription>
            Atur durasi penahanan stok dan pembatalan otomatis untuk pesanan
            &ldquo;Bayar di Toko&rdquo;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="hold-minutes">Durasi Hold Stok (menit)</Label>
            <Input
              id="hold-minutes"
              type="number"
              min={5}
              max={120}
              value={holdMinutes}
              onChange={(e) =>
                setHoldMinutes(clampHold(Number(e.target.value)) as number)
              }
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">
              Berapa lama stok di-hold untuk pesanan &ldquo;Bayar di Toko&rdquo;
              sebelum auto-cancel.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
              <div className="space-y-0.5">
                <Label htmlFor="auto-cancel" className="text-sm font-medium">
                  Aktifkan Auto-Cancel Otomatis
                </Label>
                <p className="text-xs text-muted-foreground">
                  Batalkan pesanan yang melewati durasi hold.
                </p>
              </div>
              <Switch
                id="auto-cancel"
                checked={autoCancel}
                onCheckedChange={setAutoCancel}
              />
            </div>
            {autoCancel ? (
              <p className="inline-flex items-center gap-1.5 text-xs text-accent">
                <ShieldAlert className="h-3.5 w-3.5" />
                Pesanan yang melebihi durasi hold akan dibatalkan otomatis.
              </p>
            ) : (
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Pesanan tidak akan dibatalkan otomatis — perlu konfirmasi manual.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slot-limit">Batasi jumlah reservasi per slot jam</Label>
            <Input
              id="slot-limit"
              type="number"
              min={1}
              max={20}
              value={slotLimit}
              onChange={(e) =>
                setSlotLimit(clampSlot(Number(e.target.value)) as number)
              }
              className="max-w-[160px]"
            />
            <p className="text-xs text-muted-foreground">
              Maksimal pembeli per slot jam pickup (10, 11, 13, 15, 17).
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={saveReservation}>
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pesanan Lunas — Batas Pengambilan */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
              <PackageCheck className="h-4 w-4" />
            </span>
            Pesanan Lunas
            <Badge className="ml-auto bg-accent/15 text-accent" variant="secondary">
              v3
            </Badge>
          </CardTitle>
          <CardDescription>
            Batas waktu pengambilan untuk pesanan yang sudah dibayar penuh
            (Midtrans). Dipakai untuk menghitung status{" "}
            <span className="font-medium text-foreground">
              Lewat Batas Pengambilan
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pickup-deadline">
              Batas Pengambilan Pesanan Lunas (hari)
            </Label>
            <Select
              value={String(pickupDeadlineDays)}
              onValueChange={(v) => setPickupDeadlineDays(Number(v))}
            >
              <SelectTrigger id="pickup-deadline" className="w-[200px]">
                <SelectValue placeholder="Pilih batas hari" />
              </SelectTrigger>
              <SelectContent>
                {PICKUP_DEADLINE_OPTIONS.map((d) => (
                  <SelectItem key={d} value={String(d)}>
                    {d} hari
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Setelah batas ini terlewati, pesanan berstatus{" "}
              <span className="font-medium text-foreground">
                &ldquo;Lewat Batas Pengambilan&rdquo;
              </span>{" "}
              — bukan dibatalkan, barang tetap bisa diambil tapi toko tidak lagi
              menjamin penyimpanannya.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={saveReservation}>
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kontak & Notifikasi */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6B7A3D]/15 text-accent">
              <Bell className="h-4 w-4" />
            </span>
            Kontak & Notifikasi
          </CardTitle>
          <CardDescription>
            Kanal kontak admin & tujuan notifikasi pesanan baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="wa-number" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              Nomor WhatsApp Admin
            </Label>
            <Input
              id="wa-number"
              type="tel"
              value={whatsappNumber}
              onChange={(e) =>
                setWhatsappNumber(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="max-w-[240px]"
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">
              Format internasional tanpa +, contoh: 6281234567890. Dipakai
              tombol &ldquo;Tanya Stok via WhatsApp&rdquo; di halaman produk.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              Email Notifikasi Pesanan Baru
            </Label>
            <Input
              id="order-email"
              type="email"
              value={orderEmail}
              onChange={(e) => setOrderEmail(e.target.value)}
              className="max-w-[280px]"
              placeholder="halo@darikotamalang.id"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <Label htmlFor="telegram-notif" className="flex items-center gap-1.5 text-sm font-medium">
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                Notifikasi Telegram untuk pesanan baru
              </Label>
              <p className="text-xs text-muted-foreground">
                Kirim pesan otomatis ke bot Telegram admin (dummy).
              </p>
            </div>
            <Switch
              id="telegram-notif"
              checked={telegramNotif}
              onCheckedChange={setTelegramNotif}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={saveContact}>
              <Save className="h-4 w-4" />
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tampilan Toko */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#C99A2E]/15 text-[#8a6a1a]">
              <Store className="h-4 w-4" />
            </span>
            Tampilan Toko
            {maintenanceMode && (
              <Badge className="ml-auto bg-[#B5502F]/15 text-[#8a3a22]">
                <ShieldAlert className="h-3 w-3" />
                Maintenance Aktif
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Kontrol elemen tampilan beranda dan status operasional toko.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <Label htmlFor="creator-banner" className="flex items-center gap-1.5 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                Tampilkan banner &ldquo;Gabung jadi kreator&rdquo; di beranda
              </Label>
              <p className="text-xs text-muted-foreground">
                Banner CTA pendaftaran konsinyasi di halaman beranda.
              </p>
            </div>
            <Switch
              id="creator-banner"
              checked={showCreatorBanner}
              onCheckedChange={setShowCreatorBanner}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode" className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                Mode maintenance toko
              </Label>
              <p className="text-xs text-muted-foreground">
                Sembunyikan toko dari pengunjung, hanya admin yang dapat
                mengakses dashboard.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={saveDisplay}>
              <Save className="h-4 w-4" />
              Simpan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
