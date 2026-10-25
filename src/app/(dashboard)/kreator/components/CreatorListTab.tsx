"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Power, PowerOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { RatingStars } from "@/components/site/rating-stars";
import { apiFetch, ApiError } from "@/lib/api";
import { Artisan } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CreatorListTabProps {
  artisans: Artisan[];
  onStatusUpdated: (updatedId: number | string, newStatus: "aktif" | "nonaktif") => void;
}

export function CreatorListTab({ artisans, onStatusUpdated }: CreatorListTabProps) {
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  const handleToggleStatus = async (artisan: Artisan) => {
    const isCurrentlyActive = artisan.status === "aktif";
    const nextStatus = isCurrentlyActive ? "nonaktif" : "aktif";
    setTogglingId(artisan.id);

    try {
      const res = await apiFetch<{ message: string; artisan: Artisan }>(
        `/api/admin/artisans/${artisan.id}/toggle-status`,
        {
          method: "PATCH",
        }
      );
      toast.success(res.message || `Status kreator ${artisan.brandName} berhasil diubah`);
      onStatusUpdated(artisan.id, nextStatus);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mengubah status kreator");
      }
    } finally {
      setTogglingId(null);
    }
  };

  if (artisans.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Belum ada kreator terdaftar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {artisans.map((c) => {
        const isInactive = c.status === "nonaktif";
        const isToggling = togglingId === c.id;

        return (
          <Card
            key={c.id}
            className={cn(
              "gap-0 overflow-hidden py-0 transition-opacity",
              isInactive && "opacity-60"
            )}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Avatar Kreator */}
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.brandName}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-secondary text-primary font-bold text-lg ring-2 ring-border">
                    {c.brandName.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-display text-base font-bold text-foreground">
                          {c.brandName}
                        </h3>
                        {c.isOfficial && (
                          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-[10px] font-semibold text-primary">
                            Official Store
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.isOfficial ? "Toko Resmi Sesuatu DariKota Malang" : c.user?.email || (c.bio ? c.bio.substring(0, 30) + "…" : "Kreator Malang")}
                      </p>
                    </div>
                    {isInactive && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-muted text-muted-foreground"
                      >
                        Nonaktif
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Package className="h-3.5 w-3.5" />
                      {c.productCount ?? c.products?.length ?? 0} produk
                    </span>
                    <RatingStars value={c.avgRating ?? 0} showValue />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                    <Link
                      href={`/produk?q=${encodeURIComponent(c.brandName)}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Lihat produk
                    </Link>

                    {c.isOfficial && (
                      <span className="text-[11px] font-medium text-muted-foreground italic">
                        Toko Resmi (Permanen Aktif)
                      </span>
                    )}

                    {!c.isOfficial && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isToggling}
                            className={cn(
                              "h-8 gap-1.5 text-xs",
                              isInactive
                                ? "text-accent hover:bg-accent/10"
                                : "text-destructive hover:bg-destructive/10"
                            )}
                          >
                            {isToggling ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : isInactive ? (
                              <Power className="h-3.5 w-3.5" />
                            ) : (
                              <PowerOff className="h-3.5 w-3.5" />
                            )}
                            {isInactive ? "Aktifkan" : "Nonaktifkan"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {isInactive
                                ? `Aktifkan kreator "${c.brandName}"?`
                                : `Nonaktifkan kreator "${c.brandName}"?`}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isInactive
                              ? `${c.brandName} akan kembali berstatus aktif dan produknya dapat tayang di toko.`
                              : `${c.brandName} akan dinonaktifkan. Produknya tidak akan muncul bagi pembeli.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleToggleStatus(c)}
                            className={isInactive ? "bg-accent text-white" : "bg-destructive text-destructive-foreground"}
                          >
                            {isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
