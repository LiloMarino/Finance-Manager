import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { pairColors } from "@/features/correlation/correlation-params";
import { formatMonth } from "@/features/correlation/format";
import type { Correlation } from "@/features/correlation/use-correlation";
import { ColorSwatch } from "@/shared/components/color-swatch";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";

const levelFormatter = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function NormalizedChart({ correlation }: { correlation: Correlation }) {
  const [firstColor, secondColor] = pairColors(correlation.first, correlation.second);
  const config = {
    first: { label: correlation.first, color: firstColor },
    second: { label: correlation.second, color: secondColor },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-56 w-full">
      <LineChart data={correlation.points} margin={{ left: 4, right: 4 }}>
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
                      <ColorSwatch shape="square" color={`var(--color-${key})`} />
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
