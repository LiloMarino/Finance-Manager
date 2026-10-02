import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { optionStyle } from "@/features/fixed-income-comparison/option-style";
import type { ComparisonOption } from "@/features/fixed-income-comparison/options";
import type { Comparison } from "@/features/fixed-income-comparison/use-comparison";
import { ChartLegend } from "@/shared/components/chart-legend";
import { ColorSwatch } from "@/shared/components/color-swatch";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { formatDate } from "@/shared/lib/format";
import { monthLabel } from "@/shared/lib/months";
import { toChartNumber } from "@/types/decimal";

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

/** `2026-03-15` vira "Mar/2026". */
function monthOf(day: string): string {
  const [year, month] = day.split("-");
  return monthLabel(Number(year), Number(month));
}

interface ComparisonChartProps {
  options: ComparisonOption[];
  comparison: Comparison;
}

/** O líquido de cada opção se resgatada em cada dia, uma linha por opção; o valor do
fim da linha vai na legenda. */
export function ComparisonChart({ options, comparison }: ComparisonChartProps) {
  const format = useValueFormat();
  // Uma série por opção, na ordem delas, cada uma com o traço próprio
  const config: ChartConfig = Object.fromEntries(
    options.map((option, index) => [
      `option${index}`,
      { label: option.label, color: optionStyle(index).color },
    ]),
  );
  const data = comparison.points.map((point) => {
    const row: Record<string, number | string | null> = { day: point.day };
    point.net_values.forEach((value, index) => {
      row[`option${index}`] = value === null ? null : toChartNumber(value);
      row[`label${index}`] = value === null ? null : format.brl(value);
    });
    return row;
  });
  const last = comparison.points.at(-1);
  const legend = options.map((option, index) => {
    const value = last?.net_values[index];
    return {
      key: `option${index}`,
      label: value ? `${option.label} ${format.brl(value)}` : option.label,
      color: optionStyle(index).color,
      shape: optionStyle(index).shape,
    };
  });

  return (
    <div className="flex flex-col gap-3">
      <ChartLegend entries={legend} />
      <ChartContainer config={config} className="aspect-auto h-72 w-full">
        <LineChart data={data} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            minTickGap={32}
            tickFormatter={monthOf}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={64}
            domain={["auto", "auto"]}
            tickFormatter={(value: number) => format.amount(axisCurrency.format(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const day: unknown = payload[0]?.payload?.day;
                  return typeof day === "string" ? formatDate(day) : null;
                }}
                formatter={(_, name, item) => {
                  const key = String(name);
                  const index = key.replace("option", "");
                  const label: unknown = item.payload[`label${index}`];
                  return (
                    <span className="flex w-full items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <ColorSwatch shape="line" color={optionStyle(Number(index)).color} />
                        {config[key]?.label}
                      </span>
                      <span className="tabular-nums">{String(label)}</span>
                    </span>
                  );
                }}
              />
            }
          />
          {options.map((_, index) => (
            <Line
              key={index}
              dataKey={`option${index}`}
              type="linear"
              stroke={`var(--color-option${index})`}
              strokeDasharray={optionStyle(index).dash}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}
