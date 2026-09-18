"use client";

import { useState } from "react";
import { ArtImage } from "./art-image";
import { cn } from "@/lib/utils";

/**
 * Renders a generated brand image when available; falls back to the
 * on-brand ArtImage illustration if the file is missing or fails to load.
 */
export function BrandImage({
  src,
  fallbackSeed,
  fallbackLabel,
  categoryId,
  alt,
  className,
  imgClassName,
  rounded = "rounded-3xl",
}: {
  src: string | null;
  fallbackSeed: string;
  fallbackLabel?: string;
  categoryId?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <ArtImage
        seed={fallbackSeed}
        categoryId={categoryId}
        label={fallbackLabel}
        className={cn(rounded, className)}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", rounded, className)}>
      <ArtImage
        seed={fallbackSeed}
        categoryId={categoryId}
        label={fallbackLabel}
        className="absolute inset-0 h-full w-full"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn(
          "relative h-full w-full object-cover transition-transform duration-700",
          imgClassName,
        )}
      />
    </div>
  );
}
