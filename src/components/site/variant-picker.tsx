"use client";

import type { Product } from "@/data/products";
import { isValueAvailable, selectOption } from "@/data/products";
import { cn } from "@/lib/utils";

/**
 * Multi-axis variant selector (Shopify-style). Renders one chip row per
 * option axis (e.g. Motif, Ukuran). Values that don't exist for the current
 * selection on other axes are automatically disabled.
 *
 * Controlled: parent owns `selected` and `onChange`.
 */
export function VariantPicker({
  product,
  selected,
  onChange,
  className,
}: {
  product: Product;
  selected: (string | null)[];
  onChange: (v: (string | null)[]) => void;
  className?: string;
}) {
  const opts = product.variantOptions;
  if (opts.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {opts.map((opt, i) => (
        <div key={opt.name}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">
              {opt.name}
            </p>
            <span className="text-xs text-muted-foreground">
              {selected[i] ?? "Pilih dulu"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => {
              const active = selected[i] === val;
              const available = isValueAvailable(product, i, val, selected);
              return (
                <button
                  key={val}
                  type="button"
                  disabled={!available}
                  onClick={() => available && onChange(selectOption(product, selected, i, val))}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground sticker-shadow"
                      : available
                        ? "border border-border bg-background text-foreground hover:border-primary/40 hover:-translate-y-0.5"
                        : "cursor-not-allowed border border-border bg-muted/40 text-muted-foreground/40 line-through",
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
