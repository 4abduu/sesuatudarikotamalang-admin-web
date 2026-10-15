import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

interface RevenueChartCardProps {
  revenueByDay?: { date: string; revenue: number }[];
  revenue7Days?: number;
}

export function RevenueChartCard({ revenueByDay, revenue7Days }: RevenueChartCardProps) {
  const chartData = (revenueByDay && revenueByDay.length > 0)
    ? revenueByDay.map((d) => {
        const dateObj = new Date(d.date);
        const dayLabel = isNaN(dateObj.getTime())
          ? d.date
          : dateObj.toLocaleDateString("id-ID", { weekday: "short" });
        return {
          label: dayLabel,
          total: d.revenue,
        };
      })
    : (() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const dt = new Date();
          dt.setDate(dt.getDate() - i);
          days.push({
            label: dt.toLocaleDateString("id-ID", { weekday: "short" }),
            total: 0,
          });
        }
        return days;
      })();

  const weeklyTotal = revenue7Days ?? chartData.reduce((s, d) => s + d.total, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Pendapatan Minggu Ini
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Total {formatRupiah(weeklyTotal)} dalam 7 hari terakhir.
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
            />
            <Bar dataKey="total" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
