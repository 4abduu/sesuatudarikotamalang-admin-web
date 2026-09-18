import { cn } from "@/lib/utils";
import { CategoryMotif } from "./line-art";
import { categoryMap } from "@/data/categories";

/* Deterministic hash -> pick from brand palette pairs */
const palettes: [string, string][] = [
  ["#A8452B", "#C45A3A"],
  ["#6B7A3D", "#8A9D52"],
  ["#C99A2E", "#E0B85A"],
  ["#8A6A3A", "#A8855A"],
  ["#8B3823", "#A8452B"],
  ["#7A6A3D", "#A89058"],
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function ArtImage({
  seed,
  categoryId,
  label,
  className,
  variant = "product",
}: {
  seed: string;
  categoryId?: string;
  label?: string;
  className?: string;
  variant?: "product" | "creator";
}) {
  const [c1, c2] = palettes[hash(seed) % palettes.length];
  const cat = categoryId ? categoryMap[categoryId] : undefined;

  if (variant === "creator") {
    const initials = (label ?? seed)
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden",
          className,
        )}
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
      >
        <span className="font-display text-3xl font-bold text-primary-foreground/90">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(140deg, ${c1}, ${c2})` }}
    >
      {/* faint motif */}
      {cat && (
        <CategoryMotif
          category={cat.id}
          className="absolute -right-6 -top-6 h-40 w-40 text-primary-foreground/15"
          stroke="var(--primary-foreground)"
          strokeWidth={2}
        />
      )}
      <CategoryMotif
        category={categoryId ?? "stiker"}
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 text-primary-foreground/40"
        stroke="var(--primary-foreground)"
        strokeWidth={2.5}
      />
      {label && (
        <div className="absolute inset-x-0 bottom-0 p-3 text-center">
          <span className="font-display text-sm font-semibold leading-tight text-primary-foreground/90 drop-shadow-sm">
            {label}
          </span>
        </div>
      )}
      {/* paper grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
