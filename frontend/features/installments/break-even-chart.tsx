import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import type { Installments } from "@/features/installments/use-installments";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type DecimalString, formatPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  discount: { label: "Desconto que empata", color: "var(--chart-1)" },
} satisfies ChartConfig;

const axisPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

interface BreakEvenChartProps {
  simulation: Installments;
  installments: number;
  /** O desconto informado, em %. */
  discount: DecimalString | null;
}

export function BreakEvenChart({ simulation, installments, discount }: BreakEvenChartProps) {
  const data = simulation.curve.map((point) => ({
    installments: point.installments,
    discount: toChartNumber(point.break_even_discount),
    label: formatPercent(point.break_even_discount),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 16, top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="installments"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${value}x`}
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
                const count: unknown = payload[0]?.payload?.installments;
                return typeof count === "number" ? `${count}x` : null;
              }}
              formatter={(_, __, item) => {
                const label: unknown = item.payload.label;
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span>Desconto que empata</span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        <ReferenceLine x={installments} stroke="var(--border)" strokeDasharray="4 4" />
        {discount && (
          <ReferenceLine
            y={toChartNumber(discount) / 100}
            stroke="var(--chart-2)"
            strokeDasharray="4 4"
            label={{
              value: "Seu desconto",
              position: "insideTopLeft",
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
        )}
        <Line
          dataKey="discount"
          type="monotone"
          stroke="var(--color-discount)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
