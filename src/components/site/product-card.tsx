import Link from "next/link";
import { Product } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { ArtImage } from "./art-image";
import { StickerBadge } from "./sticker-badge";
import { RatingStars } from "./rating-stars";
import { LeafSprig } from "./line-art";
import { formatRupiah } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const cat = categoryMap[product.categoryId];
  return (
    <Link
      href={`/produk/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-card sticker-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(43,33,26,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden">
        <ArtImage
          seed={product.id}
          categoryId={product.categoryId}
          label={product.name}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <div className="absolute left-3 top-3">
            <StickerBadge kind={product.badge} size="sm" />
          </div>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-semibold text-foreground/80 backdrop-blur-sm">
          {cat?.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{product.shortDesc}</p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="font-display text-lg font-bold text-primary">
            {formatRupiah(product.price)}
          </span>
          <RatingStars value={product.rating} size={12} />
        </div>
        <span className="text-[11px] text-muted-foreground">
          {product.soldCount} terjual
        </span>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-3xl bg-card sticker-shadow">
      <div className="aspect-square bg-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="mt-2 h-5 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export function Ornament() {
  return (
    <LeafSprig className="h-4 w-4 text-primary/40" strokeWidth={2} />
  );
}
