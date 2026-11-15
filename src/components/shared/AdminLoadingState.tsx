import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminLoadingStateProps {
  /** Teks keterangan proses loading (default: "Memuat data…") */
  message?: string;
  /** Kustomisasi tinggi minimal wadah loading (default: "min-h-[350px]") */
  minHeight?: string;
  /** Tambahan class Tailwind bila diperlukan */
  className?: string;
}

/**
 * Komponen Loading State standar panel Admin.
 * Menampilkan kartu seragam dengan spinner Loader2 dan teks keterangan di tengah.
 */
export function AdminLoadingState({
  message = "Memuat data…",
  minHeight = "min-h-[350px]",
  className,
}: AdminLoadingStateProps) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl border border-border bg-card p-12 text-center",
        minHeight,
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {message && <p className="text-sm font-medium">{message}</p>}
      </div>
    </div>
  );
}

