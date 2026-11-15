import Link from "next/link";
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Star,
  PackageOpen,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivityItem } from "@/lib/types";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return "";
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec <= 1) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffWeek === 1) return "seminggu lalu";
  if (diffDay < 30) return `${diffWeek} minggu lalu`;
  if (diffMonth === 1) return "sebulan lalu";
  if (diffMonth < 12) return `${diffMonth} bulan lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getActivityVisual(item: RecentActivityItem) {
  switch (item.type) {
    case "order_new":
      return { Icon: ShoppingCart, accent: "#A8452B" };
    case "order_paid":
      return { Icon: CreditCard, accent: "#2B6CB0" };
    case "order_completed":
      return { Icon: CheckCircle2, accent: "#38A169" };
    case "order_cancelled":
      return { Icon: AlertTriangle, accent: "#B5502F" };
    case "application":
      return { Icon: UserPlus, accent: "#6B7A3D" };
    case "review":
      return { Icon: Star, accent: "#C99A2E" };
    case "low_stock":
      return { Icon: PackageOpen, accent: "#C05621" };
    case "pickup":
      return { Icon: Truck, accent: "#8A6A3A" };
    default:
      if (item.text.includes("sudah diambil")) {
        return { Icon: CheckCircle2, accent: "#38A169" };
      }
      if (item.text.includes("dibayar")) {
        return { Icon: CreditCard, accent: "#2B6CB0" };
      }
      if (item.text.includes("dibatalkan") || item.text.includes("kedaluwarsa")) {
        return { Icon: AlertTriangle, accent: "#B5502F" };
      }
      if (item.text.includes("pickup") || item.text.includes("dijadwalkan")) {
        return { Icon: Truck, accent: "#8A6A3A" };
      }
      return { Icon: ShoppingCart, accent: "#A8452B" };
  }
}

interface RecentActivityCardProps {
  recentActivity?: RecentActivityItem[];
}

export function RecentActivityCard({ recentActivity = [] }: RecentActivityCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="font-display text-base font-bold">
          Aktivitas Terbaru
        </CardTitle>
        <Link
          href="/pesanan"
          className="text-xs font-semibold text-primary hover:underline"
        >
          Lihat semua
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {recentActivity.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Belum ada aktivitas terbaru tercatat
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {recentActivity.map((a) => {
              const { Icon, accent } = getActivityVisual(a);
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: accent + "22", color: accent }}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(a.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
