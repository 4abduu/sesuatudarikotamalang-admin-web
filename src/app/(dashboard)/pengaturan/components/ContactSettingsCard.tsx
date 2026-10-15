import { Phone, Mail, Save, Loader2, Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ContactSettingsCardProps {
  whatsappNumber: string;
  onWhatsappChange: (val: string) => void;
  notificationEmail: string;
  onEmailChange: (val: string) => void;
  onSave: () => void;
  loading: boolean;
}

export function ContactSettingsCard({
  whatsappNumber,
  onWhatsappChange,
  notificationEmail,
  onEmailChange,
  onSave,
  loading,
}: ContactSettingsCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#6B7A3D]/15 text-accent">
            <Bell className="h-4 w-4" />
          </span>
          Kontak Toko & Notifikasi
        </CardTitle>
        <CardDescription>
          Nomor WhatsApp resmi admin toko dan alamat email penerima notifikasi sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="wa-number" className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            Nomor WhatsApp Admin Toko
          </Label>
          <Input
            id="wa-number"
            type="tel"
            value={whatsappNumber}
            onChange={(e) => onWhatsappChange(e.target.value)}
            placeholder="+6281234567890"
            className="max-w-[280px]"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Nomor WhatsApp yang ditautkan ke tombol kontak dan konfirmasi pembeli di aplikasi mobile.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order-email" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Email Notifikasi Admin
          </Label>
          <Input
            id="order-email"
            type="email"
            value={notificationEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="admin@darikotamalang.id"
            className="max-w-[320px]"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Alamat email yang digunakan server untuk mengirimkan ringkasan pesanan baru dan pengajuan kreator.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={onSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Kontak
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
