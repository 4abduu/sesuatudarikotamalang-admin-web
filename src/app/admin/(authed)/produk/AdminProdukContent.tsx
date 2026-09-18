"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader, EmptyState } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  products as allProducts,
  type Product,
  totalStock as computeTotalStock,
  isLowStock,
  lowStockVariants,
} from "@/data/products";
import { categories, categoryMap } from "@/data/categories";
import { formatRupiah } from "@/lib/format";
import { ArtImage } from "@/components/site/art-image";
import { cn } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 6;

/**
 * Kelola Produk page BODY (admin product list with search/filter + delete
 * AlertDialog). Extracted from `produk/page.tsx` so the same body can be
 * rendered inside the export-figma combo page (without AdminShell).
 *
 * Exposes:
 *   - `AdminProdukContent`: the page body.
 *   - `DeleteProductAlertDialog`: the AlertDialog content used for the
 *     "Hapus Produk" confirmation — also used by the export-figma Modals
 *     section so the dialog appears inline as a static card.
 */
export function AdminProdukContent() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (categoryId !== "all" && p.categoryId !== categoryId) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.shortDesc.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [search, categoryId]);

  return (
    <div>
      <AdminPageHeader
        title="Kelola Produk"
        description="Kelola semua produk yang tayang di toko."
      >
        <Button asChild className="gap-1.5">
          <Link href="/admin/produk/tambah">
            <Plus className="h-4 w-4" />
            Tambah Produk Baru
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Toolbar */}
      <Card className="mb-4 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk atau deskripsi singkat…"
              className="pl-9"
            />
          </div>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground sm:w-24 sm:text-right">
            {filtered.length} produk
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={PackageOpen}
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain atau ubah filter kategori."
          />
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden p-0 md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="pl-5">Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-5 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function totalStock(p: Product) {
  return computeTotalStock(p);
}

function isLow(p: Product) {
  return isLowStock(p, LOW_STOCK_THRESHOLD);
}

function lowVariants(p: Product) {
  return lowStockVariants(p, LOW_STOCK_THRESHOLD);
}

function ProductRow({ product }: { product: Product }) {
  const low = isLow(product);
  const lows = lowVariants(product);
  const stock = totalStock(product);

  return (
    <TableRow>
      <TableCell className="pl-5">
        <div className="flex items-center gap-3">
          <ArtImage
            seed={product.id}
            categoryId={product.categoryId}
            className="h-10 w-10 shrink-0 rounded-md"
          />
          <div className="min-w-0 max-w-[20rem]">
            <p className="truncate font-medium text-foreground">
              {product.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {product.shortDesc}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-normal">
          {categoryMap[product.categoryId]?.name ?? product.categoryId}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">
        {formatRupiah(product.price)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            low && "text-[#B5502F]",
          )}
        >
          {low && <AlertTriangle className="h-3.5 w-3.5" />}
          {stock}
        </span>
        {low && (
          <p className="text-[11px] text-muted-foreground">
            varian menipis: {lows.map((v) => `${v.options.join(" / ")} (${v.stock})`).join(", ")}
          </p>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="border-accent/30 text-accent">
          Aktif
        </Badge>
      </TableCell>
      <TableCell className="pr-5 text-right">
        <div className="inline-flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5"
          >
            <Link href={`/admin/produk/${product.id}/edit`}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <DeleteButton product={product} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProductCard({ product }: { product: Product }) {
  const low = isLow(product);
  const stock = totalStock(product);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <ArtImage
          seed={product.id}
          categoryId={product.categoryId}
          className="h-12 w-12 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{product.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {product.shortDesc}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {categoryMap[product.categoryId]?.name ?? product.categoryId}
            </Badge>
            <Badge variant="outline" className="border-accent/30 text-accent">
              Aktif
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Harga
          </p>
          <p className="text-sm font-semibold text-foreground">
            {formatRupiah(product.price)}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Stok
          </p>
          <p
            className={cn(
              "text-sm font-semibold",
              low ? "text-[#B5502F]" : "text-foreground",
            )}
          >
            {stock}
            {low && " (varian menipis)"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
        >
          <Link href={`/admin/produk/${product.id}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <DeleteButton product={product} className="flex-1" />
      </div>
    </Card>
  );
}

function DeleteButton({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  return (
    <AlertDialog>
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
            Produk <strong>{product.name}</strong> akan dihapus dari etalase.
            Aksi ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => toast.success("Produk dihapus (dummy)")}
          >
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
