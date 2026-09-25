import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { Performance } from "@/features/performance/use-performance";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";
import { formatSignedPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  cumulative: { label: "Rentabilidade", color: "var(--chart-1)" },
} satisfies ChartConfig;

const axisPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

export function PerformanceChart({ points }: { points: Performance["points"] }) {
  const data = points.map((point) => ({
    day: point.day,
    cumulative: toChartNumber(point.cumulative_return),
    label: formatSignedPercent(point.cumulative_return),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          tickFormatter={(day: string) => formatDate(day).slice(3)}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => axisPercent.format(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const day: unknown = payload[0]?.payload?.day;
                return typeof day === "string" ? formatDate(day) : null;
              }}
              formatter={(_, __, item) => (
                <span className="flex w-full justify-between gap-4">
                  <span>Rentabilidade</span>
                  <span className="tabular-nums">{String(item.payload.label)}</span>
                </span>
              )}
            />
          }
        />
        <Area
          dataKey="cumulative"
          type="monotone"
          stroke="var(--color-cumulative)"
          fill="var(--color-cumulative)"
          fillOpacity={0.15}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}
