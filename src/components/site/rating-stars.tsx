import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  size = 14,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className={filled ? "fill-[#C99A2E] text-[#C99A2E]" : "fill-muted text-muted-foreground/40"}
            />
          );
        })}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-foreground/80">{value.toFixed(1)}</span>
      )}
    </span>
  );
}
