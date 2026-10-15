import Link from "next/link";
import {
  ShoppingCart,
  UserPlus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const recentActivity = [
  {
    id: "a1",
    Icon: ShoppingCart,
    accent: "#A8452B",
    text: "Pesanan baru #SDK-0248 dari Yoga Mahendra",
    time: "12 menit lalu",
  },
  {
    id: "a2",
    Icon: UserPlus,
    accent: "#6B7A3D",
    text: "Pengajuan konsinyasi baru dari Rina Wulandari (Linen House Studio)",
    time: "2 jam lalu",
  },
  {
    id: "a3",
    Icon: Star,
    accent: "#C99A2E",
    text: "Ulasan baru 5 bintang untuk Pin Enamel Apel Malang",
    time: "3 jam lalu",
  },
  {
    id: "a4",
    Icon: AlertTriangle,
    accent: "#B5502F",
    text: "Stok Kaos Heritage Kayutangan varian XL menipis (3 tersisa)",
    time: "5 jam lalu",
  },
  {
    id: "a5",
    Icon: CheckCircle2,
    accent: "#6B7A3D",
    text: "Pesanan #SDK-0244 sudah diambil oleh Dimas Saputra",
    time: "kemarin",
  },
  {
    id: "a6",
    Icon: Truck,
    accent: "#8A6A3A",
    text: "2 pesanan dijadwalkan pickup hari ini (10:00 & 17:00)",
    time: "kemarin",
  },
];

export function RecentActivityCard() {
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
        <ul className="divide-y divide-border">
          {recentActivity.map((a) => {
            const Icon = a.Icon;
            return (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: a.accent + "22", color: a.accent }}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
