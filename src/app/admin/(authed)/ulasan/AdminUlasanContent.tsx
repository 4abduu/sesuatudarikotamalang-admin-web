"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Trash2,
  Star,
  Search,
  MessageSquareQuote,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminPageHeader,
  EmptyState,
  StatCard,
} from "@/components/admin/admin-ui";
import { RatingStars } from "@/components/site/rating-stars";
import { reviews as seedReviews, type Review } from "@/data/reviews";
import { productMap } from "@/data/products";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";

type Visibility = "all" | "visible" | "hidden";

type ManagedReview = Review & { hidden: boolean };

function productNameFor(review: Review): string {
  if (!review.productId) return "Ulasan Toko";
  return productMap[review.productId]?.name ?? "Produk tidak ditemukan";
}

/**
 * Kelola Ulasan page BODY — admin review moderation with search/filter,
 * toggle visibility, and delete (AlertDialog controlled via
 * `pendingDeleteId` state).
 *
 * Extracted from `ulasan/page.tsx` so the same body can be rendered inside
 * the export-figma combo page (without AdminShell).
 */
export function AdminUlasanContent() {
  // Local copy of reviews — each gets a `hidden` flag tracked client-side.
  const [items, setItems] = useState<ManagedReview[]>(() =>
    seedReviews.map((r) => ({ ...r, hidden: false })),
  );
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [query, setQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Aggregates computed from the LIVE list (toggle/delete reflects immediately).
  const averageRating = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, r) => acc + r.rating, 0);
    return sum / items.length;
  }, [items]);

  const visibleCount = useMemo(
    () => items.filter((r) => !r.hidden).length,
    [items],
  );
  const hiddenCount = items.length - visibleCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((r) => {
      if (visibility === "visible" && r.hidden) return false;
      if (visibility === "hidden" && !r.hidden) return false;
      if (!q) return true;
      return (
        r.author.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
      );
    });
  }, [items, visibility, query]);

  const toggleHidden = (id: string) => {
    const target = items.find((r) => r.id === id);
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hidden: !r.hidden } : r)),
    );
    if (target) {
      toast.success(
        target.hidden ? "Ulasan ditampilkan" : "Ulasan disembunyikan",
        { description: `${target.author} · ${productNameFor(target)}` },
      );
    }
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const target = items.find((r) => r.id === pendingDeleteId);
    setItems((prev) => prev.filter((r) => r.id !== pendingDeleteId));
    if (target) {
      toast.success("Ulasan dihapus", {
        description: `${target.author} · ${productNameFor(target)}`,
      });
    }
    setPendingDeleteId(null);
  };

  return (
    <div>
      <AdminPageHeader
        title="Kelola Ulasan"
        description="Moderasi ulasan dari pembeli."
      />

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rata-rata Rating"
          value={averageRating.toFixed(1)}
          hint="Dari semua ulasan terdaftar"
          icon={Star}
          accent="mustard"
        />
        <StatCard
          label="Total Ulasan"
          value={items.length}
          hint={`${visibleCount} tampil · ${hiddenCount} disembunyikan`}
          icon={MessageSquareQuote}
          accent="primary"
        />
      </div>

      {/* Toolbar */}
      <Card className="mt-6">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama pembeli / komentar…"
              className="pl-9"
              aria-label="Cari ulasan"
            />
          </div>
          <Select
            value={visibility}
            onValueChange={(v) => setVisibility(v as Visibility)}
          >
            <SelectTrigger
              className="w-full sm:w-[180px]"
              aria-label="Filter tampilan"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="visible">Tampil</SelectItem>
              <SelectItem value="hidden">Disembunyikan</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Result count */}
      <div className="mt-4 flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          Menampilkan{" "}
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          dari {items.length} ulasan
        </p>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-3">
          <CardContent>
            <EmptyState
              icon={MessageSquareQuote}
              title="Tidak ada ulasan ditemukan"
              description="Coba ubah pencarian atau filter status untuk melihat ulasan lain."
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="mt-3 hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
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
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className={r.hidden ? "opacity-60" : undefined}
                  >
                    <TableCell className="pl-4">
                      <p className="font-semibold text-foreground">{r.author}</p>
                      <p className="text-xs text-muted-foreground">{r.city}</p>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">
                      {productNameFor(r)}
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
                      {r.date}
                    </TableCell>
                    <TableCell>
                      {r.hidden ? (
                        <Badge variant="secondary">Disembunyikan</Badge>
                      ) : (
                        <Badge className="bg-accent/15 text-accent">Tampil</Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleHidden(r.id)}
                          aria-label={
                            r.hidden ? "Tampilkan ulasan" : "Sembunyikan ulasan"
                          }
                        >
                          {r.hidden ? (
                            <>
                              <Eye className="h-4 w-4" />
                              <span className="hidden xl:inline">Tampilkan</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-4 w-4" />
                              <span className="hidden xl:inline">Sembunyikan</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setPendingDeleteId(r.id)}
                          aria-label="Hapus ulasan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile stacked cards */}
          <div className="mt-3 flex flex-col gap-3 lg:hidden">
            {filtered.map((r) => (
              <Card key={r.id} className={r.hidden ? "opacity-60" : undefined}>
                <CardContent className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-display text-base font-bold text-foreground">
                        {r.author}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.city}</p>
                    </div>
                    {r.hidden ? (
                      <Badge variant="secondary">Disembunyikan</Badge>
                    ) : (
                      <Badge className="bg-accent/15 text-accent">Tampil</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground/80">
                      {productNameFor(r)}
                    </span>
                    <RatingStars value={r.rating} size={14} showValue />
                  </div>
                  <p className="line-clamp-3 text-sm text-foreground/80">
                    {r.comment}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleHidden(r.id)}
                      >
                        {r.hidden ? (
                          <>
                            <Eye className="h-4 w-4" />
                            Tampilkan
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Sembunyikan
                          </>
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setPendingDeleteId(r.id)}
                        aria-label="Hapus ulasan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Hapus ulasan ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ulasan akan dihapus permanen dari daftar moderasi. Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Ulasan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
