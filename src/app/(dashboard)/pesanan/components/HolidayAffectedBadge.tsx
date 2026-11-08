import { CalendarOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatDateId } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Badge kecil untuk daftar pesanan: tampil hanya bila pesanan terdampak libur. */
export function HolidayAffectedBadge({ affected, className }: { affected?: boolean; className?: string }) {
  if (!affected) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive",
        className
      )}
    >
      <CalendarOff className="h-3 w-3" />
      Terdampak libur
    </span>
  );
}

/**
 * Keterangan untuk detail pesanan. `reason` berasal dari `holidayInfo.reason` pada respons pesanan
 * (alasan libur; untuk libur mingguan backend mengirim teks seperti "Libur mingguan (Selasa)").
 */
export function HolidayAffectedNotice({
  affected,
  reason,
  pickupDate,
}: {
  affected?: boolean;
  reason?: string | null;
  pickupDate: string;
}) {
  if (!affected) return null;
  const dateText = formatDateId(pickupDate.slice(0, 10));
  return (
    <Alert>
      <CalendarOff className="h-4 w-4" />
      <AlertTitle>Pesanan terdampak libur toko</AlertTitle>
      <AlertDescription>
        Toko libur pada {dateText}
        {reason ? ` (${reason})` : ""}. Pesanan ini khusus: pembeli bisa mengambilnya kapan saja saat toko buka.
        Hubungi pembeli lewat WhatsApp. Kalau pembeli ingin membatalkan, batalkan manual dengan alasan
        &ldquo;Kesalahan toko&rdquo; supaya pesanan yang sudah dibayar bisa direfund.
      </AlertDescription>
    </Alert>
  );
}

