import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, Flame } from "lucide-react";

type BadgeKind = "limited" | "story" | "bestseller";

const styles: Record<BadgeKind, { label: string; cls: string; Icon: React.FC<{ className?: string }> }> = {
  limited: {
    label: "Limited Edition",
    cls: "bg-accent text-accent-foreground",
    Icon: Flame,
  },
  story: {
    label: "Ada Cerita di Baliknya",
    cls: "bg-primary text-primary-foreground",
    Icon: BookOpen,
  },
  bestseller: {
    label: "Best Seller",
    cls: "bg-[#C99A2E] text-[#2B211A]",
    Icon: Sparkles,
  },
};

export function StickerBadge({
  kind,
  className,
  size = "md",
}: {
  kind: BadgeKind;
  className?: string;
  size?: "sm" | "md";
}) {
  const s = styles[kind];
  const Icon = s.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full sticker-shadow font-semibold whitespace-nowrap",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        s.cls,
        className,
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {s.label}
    </span>
  );
}
