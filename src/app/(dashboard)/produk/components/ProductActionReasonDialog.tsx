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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiError } from "@/lib/api";

export type ProductReasonMode = "reject" | "hide" | "withdraw";

const CONFIG: Record<
  ProductReasonMode,
  { title: string; description: string; endpoint: string; required: boolean; submit: string; placeholder: string }
> = {
  reject: {
    title: "Tolak produk",
    description: "Alasan penolakan dikirim ke kreator lewat notifikasi, dan tampil di halaman Produk Saya miliknya.",
    endpoint: "reject",
    required: true,
    submit: "Tolak Produk",
    placeholder: "Contoh: foto kurang jelas, harga tidak sesuai, produk sama dengan yang sudah ditarik",
  },
  hide: {
    title: "Sembunyikan produk",
    description:
      "Produk disembunyikan dari katalog. Kreator menerima notifikasi berisi alasan, dan produk berstatus Disembunyikan admin.",
    endpoint: "hide",
    required: true,
    submit: "Sembunyikan",
    placeholder: "Contoh: produk melanggar ketentuan, foto tidak pantas",
  },
  withdraw: {
    title: "Tarik produk (tidak laku 6 bulan)",
    description:
      "Produk disembunyikan dan berstatus Ditarik. Kreator menerima notifikasi dan bisa mengajukan produk pengganti. Kreator tidak bisa mengaktifkan kembali produk yang ditarik.",
    endpoint: "withdraw",
    required: false,
    submit: "Tarik Produk",
    placeholder: "Catatan tambahan untuk kreator (opsional)",
  },
};

/**
 * Dialog alasan untuk tiga aksi admin pada produk: tolak pengajuan, sembunyikan produk aktif,
 * dan tarik produk yang tidak laku. Semuanya mengirim `{ reason }` ke POST /api/admin/products/:id/<aksi>.
 */
export function ProductActionReasonDialog({
  open,
  mode,
  productId,
  productName,
  onClose,
  onDone,
}: {
  open: boolean;
  mode: ProductReasonMode;
  productId: string | number | null;
  productName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const cfg = CONFIG[mode];
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setError(null);
    }
  }, [open, mode, productId]);

  async function submit() {
    if (productId === null) return;
    const clean = reason.trim();
    if (cfg.required && clean.length < 3) {
      setError("Alasan wajib diisi (minimal 3 karakter).");
      return;
    }
    if (clean.length > 300) {
      setError("Alasan maksimal 300 karakter.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ message?: string }>(`/api/admin/products/${productId}/${cfg.endpoint}`, {
        method: "POST",
        body: JSON.stringify(clean ? { reason: clean } : {}),
      });
      toast.success(res.message || "Berhasil");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Aksi gagal diproses");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !submitting && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
          <DialogDescription>
            <span className="font-semibold text-foreground">{productName}</span>. {cfg.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="product-reason">Alasan{cfg.required ? "" : " (opsional)"}</Label>
          <Textarea
            id="product-reason"
            rows={4}
            maxLength={300}
            placeholder={cfg.placeholder}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
          />
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {cfg.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

