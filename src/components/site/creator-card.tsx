import Link from "next/link";
import { Creator } from "@/data/creators";
import { ArtImage } from "./art-image";
import { RatingStars } from "./rating-stars";
import { MapPin, Package } from "lucide-react";

export function CreatorCard({ creator }: { creator: Creator }) {
  return (
    <Link
      href={`/kreator/${creator.id}`}
      className="group flex flex-col items-center gap-3 rounded-3xl bg-card p-5 text-center sticker-shadow transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative">
        <ArtImage
          seed={creator.id}
          label={creator.name}
          variant="creator"
          className="h-24 w-24 rounded-full ring-4 ring-background transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-background px-2 py-0.5 text-[11px] font-semibold text-accent sticker-shadow">
          {creator.specialty}
        </span>
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold text-foreground">{creator.name}</h3>
        <p className="text-xs text-muted-foreground">@{creator.handle}</p>
      </div>
      <p className="line-clamp-2 text-xs text-muted-foreground">{creator.bio}</p>
      <div className="flex w-full items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> Malang
        </span>
        <span className="inline-flex items-center gap-1">
          <Package className="h-3.5 w-3.5" /> {creator.productCount} produk
        </span>
        <RatingStars value={creator.rating} size={12} />
      </div>
    </Link>
  );
}
