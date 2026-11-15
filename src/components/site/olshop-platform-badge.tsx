import { OLSHOP_META, type OlshopPlatform } from "@/lib/olshop";

/** Lencana kecil berwarna khas marketplace (pengganti logo resmi di admin). */
export function OlshopPlatformBadge({ platform }: { platform: OlshopPlatform }) {
  const meta = OLSHOP_META[platform];
  return (
    <span
      aria-hidden="true"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[11px] font-bold text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.initial}
    </span>
  );
}
