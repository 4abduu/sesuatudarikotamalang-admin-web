"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch } from "@/lib/api";

const PRESETS = [
  "Foto tidak pantas",
  "Foto bukan gambar pengguna / disalahgunakan",
  "Lainnya",
] as const;
const REASON_MAX = 200;

interface RemoveAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "pengguna" = foto akun (users), "toko" = foto toko kreator (artisans). */
  target: "pengguna" | "toko";
  /** id pengguna (target "pengguna") atau id toko/artisan (target "toko"). */
  id: string;
  /** Nama pengguna atau nama toko, untuk judul dialog. */
  name: string;
  /** Untuk target "pengguna": true bila pengguna berperan kreator (tampilkan peringatan). */
  isCreator?: boolean;
  /** Dipanggil setelah foto berhasil dihapus. */
  onDone: () => void;
}

/** Dialog moderasi: hapus foto profil pengguna atau foto toko kreator dengan alasan. */
export function RemoveAvatarDialog({
  open,
  onOpenChange,
  target,
  id,
  name,
  isCreator = false,
  onDone,
}: RemoveAvatarDialogProps) {
  const [preset, setPreset] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmedNote = note.trim();
  const reason = preset ? (trimmedNote ? `${preset}: ${trimmedNote}` : preset) : "";
  const tooLong = reason.length > REASON_MAX;
  const isUser = target === "pengguna";

  function handleOpenChange(next: boolean) {
    if (submitting) return;
    if (!next) {
      setPreset("");
      setNote("");
    }
    onOpenChange(next);
  }

  async function submit() {
    if (!preset || tooLong || submitting) return;
    setSubmitting(true);
    try {
      await apiFetch(`/api/admin/${isUser ? "users" : "artisans"}/${id}/reset-avatar`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      toast.success(
        isUser
          ? "Foto profil dihapus. Pengguna sudah diberi tahu."
          : "Foto toko dihapus. Pemilik sudah diberi tahu.",
      );
      setPreset("");
      setNote("");
      onOpenChange(false);
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus foto. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUser ? `Hapus foto profil ${name}?` : `Hapus foto toko ${name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUser
              ? "Foto akan dihapus dan akun kembali memakai tampilan default. Pengguna akan menerima pemberitahuan."
              : "Foto toko akan dihapus dan toko kembali memakai foto akun pemiliknya. Pemilik akan menerima pemberitahuan."}
          </AlertDialogDescription>
          {isUser && isCreator && (
            <p className="text-xs text-muted-foreground">
              Foto ini juga tampil sebagai foto tokonya bila toko belum punya foto sendiri.
            </p>
          )}
        </AlertDialogHeader>

        <div className="space-y-3">
          <Select value={preset} onValueChange={setPreset}>
            <SelectTrigger className="w-full" aria-label="Alasan">
              <SelectValue placeholder="Pilih alasan" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-1">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
              rows={3}
            />
            <p className={`text-xs ${tooLong ? "text-destructive" : "text-muted-foreground"}`}>
              {reason.length}/{REASON_MAX} karakter
              {tooLong ? ". Persingkat catatan." : ""}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Batal</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!preset || tooLong || submitting}
            onClick={submit}
          >
            {submitting ? "Menghapus..." : isUser ? "Hapus foto" : "Hapus foto toko"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
