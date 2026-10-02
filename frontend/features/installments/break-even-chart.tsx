import { CartesianGrid, Line, LineChart, ReferenceDot, XAxis, YAxis } from "recharts";

import type { Installments } from "@/features/installments/use-installments";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type DecimalString, formatPercent, formatQuantity, toChartNumber } from "@/types/decimal";

const chartConfig = {
  discount: { label: "Desconto que empata", color: "var(--foreground)" },
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

/** A curva do desconto que empata por número de parcelas, com o ponto da compra. */
export function BreakEvenChart({ simulation, installments, discount }: BreakEvenChartProps) {
  const data = simulation.curve.map((point) => ({
    installments: point.installments,
    discount: toChartNumber(point.break_even_discount),
    label: formatPercent(point.break_even_discount),
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-52 w-full">
      <LineChart data={data} margin={{ left: 4, right: 24, top: 16, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="installments"
          type="number"
          domain={["dataMin", "dataMax"]}
          ticks={[1, 6, 12, 18, 24].filter((tick) => tick <= data.length)}
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
        <Line
          dataKey="discount"
          type="monotone"
          stroke="var(--color-discount)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        {discount && (
          <ReferenceDot
            x={installments}
            y={toChartNumber(discount) / 100}
            r={5}
            ifOverflow="extendDomain"
            fill={simulation.winner === "cash" ? "var(--gain)" : "var(--muted-foreground)"}
            stroke="var(--card)"
            strokeWidth={2}
            label={{
              value: `Você: ${formatQuantity(discount)}% em ${installments}x`,
              position: "right",
              fill: "var(--ink-2)",
              fontSize: 12,
            }}
          />
        )}
      </LineChart>
    </ChartContainer>
  );
}
