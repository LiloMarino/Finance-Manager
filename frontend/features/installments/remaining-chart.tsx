import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import type { Installments } from "@/features/installments/use-installments";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { monthLabels } from "@/shared/lib/months";
import { toChartNumber } from "@/types/decimal";

const chartConfig = {
  remaining: { label: "Fica aplicado", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

/** "2027-03-10" vira "Mar". */
function monthOf(day: string): string {
  return monthLabels[Number(day.slice(5, 7)) - 1] ?? day;
}

/** O que fica aplicado hoje e depois de cada parcela; a última barra é a sobra. */
export function RemainingChart({ simulation }: { simulation: Installments }) {
  const format = useValueFormat();
  const data = [
    {
      label: "Hoje",
      remaining: toChartNumber(simulation.total),
      text: format.brl(simulation.total),
    },
    ...simulation.withdrawals.map((withdrawal) => ({
      label: monthOf(withdrawal.due_date),
      remaining: toChartNumber(withdrawal.remaining),
      text: format.brl(withdrawal.remaining),
    })),
  ];

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={4} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => format.amount(axisCurrency.format(value))}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(_, __, item) => {
                const text: unknown = item.payload.text;
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span>Fica aplicado</span>
                    <span className="tabular-nums">{String(text)}</span>
                  </span>
                );
              }}
            />
          }
        />
        <Bar dataKey="remaining" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={index === data.length - 1 ? "var(--gain)" : "var(--color-remaining)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
