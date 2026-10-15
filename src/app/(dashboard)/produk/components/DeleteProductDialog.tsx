"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiFetch, ApiError } from "@/lib/api";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DeleteProductDialogProps {
  product: Product;
  onSuccess: (deletedId: number | string) => void;
  className?: string;
}

export function DeleteProductDialog({
  product,
  onSuccess,
  className,
}: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await apiFetch<{ message: string }>(`/api/products/${product.id}`, {
        method: "DELETE",
      });
      toast.success(`Produk "${product.name}" berhasil dihapus`);
      onSuccess(product.id);
      setOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal menghapus produk");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive",
            className,
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Produk <strong>{product.name}</strong> akan dihapus (soft-delete) dari etalase toko.
            Aksi ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
            {loading ? "Menghapus…" : "Ya, Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
