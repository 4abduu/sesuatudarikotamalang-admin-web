"use client";

import { useState } from "react";
import { OrderItem } from "@/lib/types";
import { variantLabel } from "@/lib/order-items";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** Daftar yang sama untuk detail pesanan dan pemeriksaan barang saat scan. */
export function OrderItemsList({ items }: { items: OrderItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 2);
  const hiddenCount = items.length - visible.length;
  return (
    <div className="space-y-3 text-sm">
      {visible.map((item) => (
        <div key={item.id} className="border-b border-border pb-3 last:border-0">
          <p className="break-words font-medium text-foreground">{item.product?.name || "Produk"}</p>
          <p className="text-xs text-muted-foreground">{variantLabel(item)}</p>
          {item.product?.artisan?.brandName && <p className="text-xs text-muted-foreground">{item.product.artisan.brandName}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            {item.quantity} unit × {formatRupiah(item.priceSnapshot)}
          </p>
          <p className="font-semibold">{formatRupiah(item.quantity * item.priceSnapshot)}</p>
        </div>
      ))}
      {items.length > 2 && (
        <Button type="button" variant="ghost" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? "Tampilkan lebih sedikit" : `Lihat ${hiddenCount} item lainnya`}
        </Button>
      )}
      {items.length === 0 && <p className="text-muted-foreground">Tidak ada rincian barang.</p>}
    </div>
  );
}
