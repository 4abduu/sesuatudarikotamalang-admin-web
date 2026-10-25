import { Clock, ShieldAlert, Save, Loader2 } from "lucide-react";
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

interface ReservationSettingsCardProps {
  holdMinutes: number;
  onHoldMinutesChange: (val: number) => void;
  autoCancel: boolean;
  onAutoCancelChange: (val: boolean) => void;
  refundWindowDays: number;
  onRefundWindowDaysChange: (val: number) => void;
  onSave: () => void;
  loading: boolean;
}

export function ReservationSettingsCard({
  holdMinutes,
  onHoldMinutesChange,
  autoCancel,
  onAutoCancelChange,
  refundWindowDays,
  onRefundWindowDaysChange,
  onSave,
  loading,
}: ReservationSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-4 w-4" />
          </span>
          Reservasi & Stok (Bayar di Toko)
        </CardTitle>
        <CardDescription>
          Atur durasi penahanan stok dan pembatalan otomatis untuk pesanan &ldquo;Bayar di Toko&rdquo; (COD), serta batas waktu pengajuan refund online.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="hold-minutes">Durasi Hold Stok (menit)</Label>
          <Input
            id="hold-minutes"
            type="number"
            min={15}
            max={1440}
            value={holdMinutes}
            onChange={(e) => onHoldMinutesChange(Number(e.target.value))}
            className="max-w-[180px]"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Batas waktu penahanan stok sebelum pesanan kedaluwarsa (15 – 1440 menit / default 1440 menit atau 1 hari).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="refund-window">Batas Waktu Refund Pembeli (hari)</Label>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 7].map((days) => (
              <Button
                key={days}
                type="button"
                variant={refundWindowDays === days ? "default" : "outline"}
                size="sm"
                onClick={() => onRefundWindowDaysChange(days)}
                disabled={loading}
                className="h-9 px-4 text-xs font-semibold"
              >
                {days} Hari {days === 3 && "(Default)"}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Pembeli yang sudah membayar dapat meminta pembatalan sampai batas ini, atau sampai jadwal pengambilan bila lebih awal.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3.5">
            <div className="space-y-0.5">
              <Label htmlFor="auto-cancel" className="text-sm font-medium">
                Aktifkan Auto-Cancel Otomatis
              </Label>
              <p className="text-xs text-muted-foreground">
                Batalkan pesanan yang melewati durasi hold dan lepaskan kembali stok ke etalase.
              </p>
            </div>
            <Switch
              id="auto-cancel"
              checked={autoCancel}
              onCheckedChange={onAutoCancelChange}
              disabled={loading}
            />
          </div>
          {autoCancel ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-accent">
              <ShieldAlert className="h-3.5 w-3.5" />
              Pesanan yang melebihi durasi hold akan dibatalkan otomatis oleh sistem.
            </p>
          ) : (
            <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Pesanan tidak dibatalkan otomatis — stok tetap ditahan sampai admin memproses.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={onSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Reservasi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
