import { PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatus } from "@/lib/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_bayar: "Menunggu Bayar",
  lunas: "Lunas",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  kedaluwarsa: "Kedaluwarsa",
  lewat_batas_pengambilan: "Lewat Batas Pengambilan",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  menunggu_bayar: "#C99A2E",
  lunas: "#6B7A3D",
  selesai: "#A8452B",
  dibatalkan: "#7A6A5A",
  kedaluwarsa: "#9B3320",
  lewat_batas_pengambilan: "#B5502F",
};

interface OrderStatusDonutCardProps {
  statusDistribution?: { status: OrderStatus; count: number }[];
}

export function OrderStatusDonutCard({ statusDistribution = [] }: OrderStatusDonutCardProps) {
  const chartData = statusDistribution
    .map((item) => ({
      name: STATUS_LABELS[item.status] || item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || "#7A6A5A",
    }))
    .filter((d) => d.value > 0);

  const totalOrdersCount = statusDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <PieChartIcon className="h-4 w-4 text-primary" />
          Status Pesanan
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Distribusi status seluruh pesanan.
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-12">Belum ada data pesanan</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-foreground">
                  {totalOrdersCount}
                </span>
                <span className="text-[10px] text-muted-foreground">pesanan</span>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5">
              {chartData.map((s) => (
                <li key={s.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1 text-muted-foreground">{s.name}</span>
                  <span className="font-semibold text-foreground">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
