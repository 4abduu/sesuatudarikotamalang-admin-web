import { PackageCheck, Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEADLINE_OPTIONS = [7, 14, 30] as const;

interface PickupDeadlineCardProps {
  deadlineDays: number;
  onDeadlineChange: (val: number) => void;
  onSave: () => void;
  loading: boolean;
}

export function PickupDeadlineCard({
  deadlineDays,
  onDeadlineChange,
  onSave,
  loading,
}: PickupDeadlineCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
            <PackageCheck className="h-4 w-4" />
          </span>
          Batas Pengambilan Pesanan Lunas
        </CardTitle>
        <CardDescription>
          Batas waktu pengambilan untuk pesanan yang sudah dibayar penuh (Midtrans). Digunakan untuk menghitung status &ldquo;Lewat Batas Pengambilan&rdquo;.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="pickup-deadline">
            Batas Pengambilan (hari sejak pesanan lunas)
          </Label>
          <Select
            value={String(deadlineDays)}
            onValueChange={(v) => onDeadlineChange(Number(v))}
            disabled={loading}
          >
            <SelectTrigger id="pickup-deadline" className="w-[220px]">
              <SelectValue placeholder="Pilih batas hari" />
            </SelectTrigger>
            <SelectContent>
              {DEADLINE_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d} hari
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Bila melewati batas hari ini, pesanan akan berubah menjadi status{" "}
            <span className="font-medium text-foreground">
              &ldquo;Lewat Batas Pengambilan&rdquo;
            </span>{" "}
            (stok tetap dialokasikan, namun pembeli diminta menghubungi admin toko).
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={onSave} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan Batas Hari
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
