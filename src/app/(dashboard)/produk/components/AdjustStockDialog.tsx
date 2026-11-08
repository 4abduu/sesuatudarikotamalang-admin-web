"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";
import { ADJUST_REASONS, STOCK_REASON_LABEL, type StockReason } from "@/lib/types-operasional";
import type { Product } from "@/lib/types";

/**
 * Dialog "Sesuaikan stok". Admin mengisi perubahan (+/-), alasan, dan catatan; stok baru dihitung server.
 * Produk dengan varian wajib memilih varian. Hasilnya tercatat di Riwayat Stok.
 */
export function AdjustStockDialog({
  open,
  product,
  onClose,
  onDone,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [variantId, setVariantId] = useState("");
  const [deltaText, setDeltaText] = useState("");
  const [reason, setReason] = useState<StockReason>("barang_masuk");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const variants = useMemo(() => product?.variants ?? [], [product]);
  const hasVariants = variants.length > 0;

  useEffect(() => {
    if (!open) return;
    setVariantId(hasVariants ? String(variants[0].id) : "");
    setDeltaText("");
    setReason("barang_masuk");
    setNote("");
    setError(null);
  }, [open, hasVariants, variants]);

  const selectedVariant = variants.find((v) => String(v.id) === variantId);
  const currentStock = hasVariants
    ? selectedVariant?.effectiveStock ?? selectedVariant?.stock ?? 0
    : undefined;
  const delta = Number(deltaText);
  const validDelta = deltaText.trim() !== "" && Number.isInteger(delta) && delta !== 0;

  async function submit() {
    if (!product) return;
    if (!validDelta) return setError("Isi perubahan stok dengan bilangan bulat bukan nol, misalnya 20 atau -2.");
    if (hasVariants && !variantId) return setError("Pilih varian.");
    if (currentStock !== undefined && currentStock + delta < 0) {
      return setError(`Stok tidak boleh negatif. Stok varian ini saat ini ${currentStock}.`);
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message?: string; stock?: number }>("/api/admin/stock/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          ...(hasVariants ? { variantId } : {}),
          delta,
          reason,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });
      toast.success(res.message || "Stok disesuaikan");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyesuaikan stok");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan stok</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{product?.name}</span>. Perubahan tercatat di Riwayat Stok.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {hasVariants && (
            <div className="space-y-1.5">
              <Label htmlFor="adjust-variant">Varian</Label>
              <Select value={variantId} onValueChange={setVariantId} disabled={submitting}>
                <SelectTrigger id="adjust-variant">
                  <SelectValue placeholder="Pilih varian" />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.combination.join(" / ")} (stok {v.effectiveStock ?? v.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="adjust-delta">Perubahan stok (+ menambah, - mengurangi)</Label>
            <Input
              id="adjust-delta"
              type="number"
              inputMode="numeric"
              placeholder="Contoh: 20 atau -2"
              value={deltaText}
              onChange={(e) => setDeltaText(e.target.value)}
              disabled={submitting}
            />
            {currentStock !== undefined && validDelta && (
              <p className="text-xs text-muted-foreground">
                Stok varian: {currentStock} menjadi {currentStock + delta}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-reason">Alasan</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as StockReason)} disabled={submitting}>
              <SelectTrigger id="adjust-reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADJUST_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {STOCK_REASON_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-note">Catatan (opsional)</Label>
            <Textarea
              id="adjust-note"
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

