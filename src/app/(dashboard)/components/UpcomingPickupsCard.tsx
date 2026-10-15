import { Truck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/lib/types";

type UpcomingPickupItem = NonNullable<DashboardData["upcomingPickups"]>[number];

interface UpcomingPickupsCardProps {
  upcomingPickups?: UpcomingPickupItem[];
}

export function UpcomingPickupsCard({ upcomingPickups = [] }: UpcomingPickupsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <Truck className="h-4 w-4 text-primary" />
          Pickup Mendatang
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingPickups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada pickup tertunda.</p>
        ) : (
          upcomingPickups.map((o) => (
            <div
              key={o.id}
              className="rounded-lg border border-border bg-background/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold text-foreground">
                  {o.orderNumber}
                </span>
                <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
                  Lunas
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground">{o.user?.name ?? "Pelanggan"}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {o.items?.[0]?.product?.name ?? "Produk"}
                {(o.items?.length ?? 0) > 1 ? ` (+${(o.items?.length ?? 0) - 1} lainnya)` : ""}
              </p>
              <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Clock className="h-3.5 w-3.5" />
                {new Date(o.pickupDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                · {o.pickupSlot}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
