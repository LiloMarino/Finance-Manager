import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { Correlation } from "@/features/correlation/use-correlation";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";

const levelFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function NormalizedChart({ correlation }: { correlation: Correlation }) {
  const config = {
    first: { label: correlation.first, color: "var(--chart-1)" },
    second: { label: correlation.second, color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <LineChart data={correlation.points} margin={{ left: 4, right: 4 }}>
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
          domain={["auto", "auto"]}
          tickFormatter={(value: number) => levelFormatter.format(value)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const day: unknown = payload[0]?.payload?.day;
                return typeof day === "string" ? formatDate(day) : null;
              }}
              formatter={(value, name) => {
                const key = String(name);
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${key})` }}
                      />
                      {key === "first" ? correlation.first : correlation.second}
                    </span>
                    <span className="tabular-nums">
                      {typeof value === "number" ? levelFormatter.format(value) : "—"}
                    </span>
                  </span>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {(["first", "second"] as const).map((key) => (
          <Line
            key={key}
            dataKey={key}
            type="linear"
            stroke={`var(--color-${key})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
