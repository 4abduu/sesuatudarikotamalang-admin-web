import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularSlotsCardProps {
  slotDistribution?: { time: string; capacity: number; booked: number }[];
}

export function PopularSlotsCard({ slotDistribution }: PopularSlotsCardProps) {
  const slotList = (slotDistribution && slotDistribution.length > 0)
    ? slotDistribution.map((s) => ({
        slot: s.time,
        count: s.booked,
        isFull: s.booked >= s.capacity,
      }))
    : [
        { slot: "10:00", count: 0, isFull: false },
        { slot: "11:00", count: 0, isFull: false },
        { slot: "13:00", count: 0, isFull: false },
        { slot: "15:00", count: 0, isFull: false },
        { slot: "17:00", count: 0, isFull: false },
      ];

  const maxSlotCount = Math.max(...slotList.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <BarChart3 className="h-4 w-4 text-primary" />
          Slot Pengambilan Populer
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Jumlah pesanan per slot (hari ini).
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {slotList.map((s) => (
          <div key={s.slot} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-semibold text-foreground">
              {s.slot}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-muted">
              <div
                className="absolute inset-y-0 left-0 rounded-md bg-primary/80 transition-all"
                style={{ width: `${(s.count / maxSlotCount) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-semibold text-foreground">
              {s.count}
            </span>
            {s.isFull && (
              <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
                Penuh
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
