"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiFetch, ApiError } from "@/lib/api";
import { formatPercent } from "@/lib/format-operasional";
import type { CreatorShareInfo } from "@/lib/types-operasional";

/**
 * Dialog atur bagi hasil per kreator. Pilihan: ikut persentase utama (kirim null) atau persentase sendiri
 * (hasil nego). PATCH /api/admin/artisans/:id/revenue-share.
 */
export function EditCreatorShareDialog({
  open,
  artisan,
  defaultPercent,
  onClose,
  onSaved,
}: {
  open: boolean;
  artisan: CreatorShareInfo | null;
  defaultPercent: number;
  onClose: () => void;
  onSaved: (artisanId: string | number, creatorSharePercent: number | null, effective: number) => void;
}) {
  const [mode, setMode] = useState<"default" | "custom">("default");
  const [percentText, setPercentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !artisan) return;
    setError(null);
    if (artisan.creatorSharePercent === null) {
      setMode("default");
      setPercentText(String(defaultPercent));
    } else {
      setMode("custom");
      setPercentText(String(artisan.creatorSharePercent));
    }
  }, [open, artisan, defaultPercent]);

  async function save() {
    if (!artisan) return;
    let value: number | null = null;
    if (mode === "custom") {
      const n = Number(percentText);
      if (percentText.trim() === "" || !Number.isFinite(n) || n < 0 || n > 100) {
        setError("Persentase harus angka 0 sampai 100.");
        return;
      }
      value = n;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await apiFetch<{
        message?: string;
        artisan?: { creatorSharePercent: number | null; effectiveCreatorSharePercent: number };
      }>(`/api/admin/artisans/${artisan.id}/revenue-share`, {
        method: "PATCH",
        body: JSON.stringify({ creatorSharePercent: value }),
      });
      toast.success(res.message || "Bagi hasil kreator disimpan");
      onSaved(
        artisan.id,
        res.artisan?.creatorSharePercent ?? value,
        res.artisan?.effectiveCreatorSharePercent ?? (value ?? defaultPercent)
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan bagi hasil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !saving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bagi hasil kreator</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{artisan?.brandName}</span>. Persentase ini adalah bagian
            kreator dari omzet penjualan lewat aplikasi.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(v) => setMode(v as "default" | "custom")} className="space-y-3">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="default" id="share-default" disabled={saving} />
            <Label htmlFor="share-default">Ikut persentase utama ({formatPercent(defaultPercent)})</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="share-custom" disabled={saving} />
            <Label htmlFor="share-custom">Atur sendiri untuk kreator ini</Label>
          </div>
        </RadioGroup>

        {mode === "custom" && (
          <div className="space-y-1.5">
            <Label htmlFor="share-percent">Bagian kreator (%)</Label>
            <Input
              id="share-percent"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.5"
              className="w-[200px]"
              value={percentText}
              onChange={(e) => setPercentText(e.target.value)}
              disabled={saving}
            />
          </div>
        )}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="button" onClick={() => void save()} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

