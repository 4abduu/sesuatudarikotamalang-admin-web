import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatDateID(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface ReviewTableProps {
  reviews: Review[];
  onToggleHide: (review: Review) => void;
  onDelete: (review: Review) => void;
  actionLoadingId: number | string | null;
}

export function ReviewTable({
  reviews,
  onToggleHide,
  onDelete,
  actionLoadingId,
}: ReviewTableProps) {
  return (
    <>
      {/* Desktop table */}
      <Card className="mt-3 hidden lg:block overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Pembeli</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="max-w-xs">Komentar</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-4 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((r) => {
              const isHidden = r.status === "disembunyikan";
              const isLoading = actionLoadingId === r.id;

              return (
                <TableRow
                  key={r.id}
                  className={cn(isHidden && "opacity-60 bg-muted/20")}
                >
                  <TableCell className="pl-4">
                    <p className="font-semibold text-foreground">
                      {r.user?.name ?? "Pembeli"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.user?.email || "Pengguna terverifikasi"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground/80">
                    {r.product?.name || "Ulasan Toko"}
                  </TableCell>
                  <TableCell>
                    <RatingStars value={r.rating} size={14} showValue />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-sm text-foreground/80">
                      {r.comment}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateID(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    {isHidden ? (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        Disembunyikan
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-accent/30 text-accent">
                        Tampil
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Tombol Toggle Sembunyikan/Tampilkan */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => onToggleHide(r)}
                        className="h-8 gap-1 text-xs"
                      >
                        {isLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : isHidden ? (
                          <>
                            <Eye className="h-3.5 w-3.5" />
                            Tampilkan
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3.5 w-3.5" />
                            Sembunyikan
                          </>
                        )}
                      </Button>

                      {/* Modal Konfirmasi Hapus Ulasan */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isLoading}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus ulasan ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Ulasan dari <strong>{r.user?.name ?? "Pembeli"}</strong> akan dihapus permanen dari sistem toko.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(r)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Ya, Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile stacked cards */}
      <div className="mt-3 flex flex-col gap-3 lg:hidden">
        {reviews.map((r) => {
          const isHidden = r.status === "disembunyikan";
          const isLoading = actionLoadingId === r.id;

          return (
            <Card key={r.id} className={cn(isHidden && "opacity-60 bg-muted/20")}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-sm font-bold text-foreground">
                      {r.user?.name ?? "Pembeli"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.product?.name || "Ulasan Toko"}
                    </p>
                  </div>
                  {isHidden ? (
                    <Badge variant="secondary">Disembunyikan</Badge>
                  ) : (
                    <Badge variant="outline" className="border-accent/30 text-accent">
                      Tampil
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <RatingStars value={r.rating} size={14} showValue />
                  <span className="text-xs text-muted-foreground">
                    · {formatDateID(r.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-foreground/90">{r.comment}</p>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => onToggleHide(r)}
                    className="h-8 gap-1 text-xs"
                  >
                    {isHidden ? (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Tampilkan
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Sembunyikan
                      </>
                    )}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="h-8 text-xs text-destructive hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus ulasan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ulasan ini akan dihapus permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(r)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
