import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import { formatCorrelation, formatMonth } from "@/features/correlation/format";
import type { Correlation } from "@/features/correlation/use-correlation";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";

const chartConfig = {
  value: { label: "Correlação móvel", color: "var(--foreground)" },
} satisfies ChartConfig;

export function RollingChart({ correlation }: { correlation: Correlation }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
      <LineChart data={correlation.rolling} margin={{ left: 4, right: 4, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={48}
          tickFormatter={formatMonth}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          domain={[-1, 1]}
          ticks={[-1, -0.5, 0, 0.5, 1]}
          tickFormatter={formatCorrelation}
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
                    {typeof value === "number" ? formatCorrelation(value) : "—"}
                  </span>
                </span>
              )}
            />
          }
        />
        <ReferenceLine y={0} stroke="var(--border-strong)" />
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
