import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import type { Correlation } from "@/features/correlation/use-correlation";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";

const chartConfig = {
  value: { label: "Correlação móvel", color: "var(--chart-1)" },
} satisfies ChartConfig;

const correlationFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function RollingChart({ correlation }: { correlation: Correlation }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <LineChart data={correlation.rolling} margin={{ left: 4, right: 4 }}>
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
          width={40}
          domain={[-1, 1]}
          ticks={[-1, -0.5, 0, 0.5, 1]}
          tickFormatter={(value: number) => correlationFormatter.format(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const day: unknown = payload[0]?.payload?.day;
                return typeof day === "string" ? formatDate(day) : null;
              }}
              formatter={(value) => (
                <span className="flex w-full items-center justify-between gap-4">
                  <span>Correlação móvel</span>
                  <span className="tabular-nums">
                    {typeof value === "number" ? correlationFormatter.format(value) : "—"}
                  </span>
                </span>
              )}
            />
          }
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <Line
          dataKey="value"
          type="linear"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
