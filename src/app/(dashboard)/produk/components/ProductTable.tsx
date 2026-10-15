import Link from "next/link";
import { AlertTriangle, Pencil, Power, PowerOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeleteProductDialog } from "./DeleteProductDialog";

const LOW_STOCK_THRESHOLD = 6;

interface ProductTableProps {
  products: Product[];
  onDeleteSuccess: (id: number | string) => void;
  onToggleActive: (id: number | string, currentStatus: boolean) => void;
  togglingId: number | string | null;
}

export function ProductTable({
  products,
  onDeleteSuccess,
  onToggleActive,
  togglingId,
}: ProductTableProps) {
  return (
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
            {products.map((p) => {
              const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
              const lowVariants = p.variants?.filter((v) => v.stock < LOW_STOCK_THRESHOLD) ?? [];
              const isLow = lowVariants.length > 0;
              const isToggling = togglingId === p.id;

              return (
                <TableRow key={p.id}>
                  <TableCell className="pl-5">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-10 w-10 shrink-0 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary font-bold text-xs">
                          SDK
                        </div>
                      )}
                      <div className="min-w-0 max-w-[20rem]">
                        <p className="truncate font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.shortDescription || p.artisan?.brandName || "Produk lokal"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {p.category?.name ?? "Umum"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatRupiah(p.price)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-medium",
                        isLow && "text-[#B5502F]"
                      )}
                    >
                      {isLow && <AlertTriangle className="h-3.5 w-3.5" />}
                      {totalStock}
                    </span>
                    {isLow && (
                      <p className="text-[11px] text-muted-foreground">
                        varian menipis: {lowVariants.map((v) => `${(v.combination || []).join(" / ") || "Default"} (${v.stock})`).join(", ")}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(p.id, p.isActive)}
                      disabled={isToggling}
                      className={cn(
                        "h-7 gap-1 px-2.5 text-xs font-semibold",
                        p.isActive
                          ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                          : "border-muted-foreground/30 bg-muted/40 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {isToggling ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : p.isActive ? (
                        <Power className="h-3 w-3 text-accent" />
                      ) : (
                        <PowerOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </Button>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                      >
                        <Link href={`/produk/${p.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteProductDialog product={p} onSuccess={onDeleteSuccess} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {products.map((p) => {
          const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
          const lowVariants = p.variants?.filter((v) => v.stock < LOW_STOCK_THRESHOLD) ?? [];
          const isLow = lowVariants.length > 0;
          const isToggling = togglingId === p.id;

          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-start gap-3">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-12 w-12 shrink-0 rounded-md object-cover bg-muted"
                  />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-secondary text-primary font-bold text-xs">
                    SDK
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.shortDescription || p.artisan?.brandName || "Produk lokal"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary" className="font-normal">
                      {p.category?.name ?? "Umum"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(p.id, p.isActive)}
                      disabled={isToggling}
                      className={cn(
                        "h-6 gap-1 px-2 text-[10px] font-semibold",
                        p.isActive
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-muted-foreground/30 bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {isToggling ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : p.isActive ? (
                        <Power className="h-2.5 w-2.5 text-accent" />
                      ) : (
                        <PowerOff className="h-2.5 w-2.5 text-muted-foreground" />
                      )}
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Harga
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatRupiah(p.price)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Stok
                  </p>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isLow ? "text-[#B5502F]" : "text-foreground"
                    )}
                  >
                    {totalStock}
                    {isLow && " (varian menipis)"}
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
                  <Link href={`/produk/${p.id}/edit`}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <DeleteProductDialog
                  product={p}
                  onSuccess={onDeleteSuccess}
                  className="flex-1"
                />
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
