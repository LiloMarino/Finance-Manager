import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import type { ComparisonOption } from "@/features/fixed-income-comparison/options";
import type { Comparison } from "@/features/fixed-income-comparison/use-comparison";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { formatDate } from "@/shared/lib/format";
import { formatBRL, toChartNumber } from "@/types/decimal";

const axisCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

interface ComparisonChartProps {
  options: ComparisonOption[];
  comparison: Comparison;
}

export function ComparisonChart({ options, comparison }: ComparisonChartProps) {
  // Uma série por opção, na ordem delas, cada uma com uma cor do tema
  const config: ChartConfig = Object.fromEntries(
    options.map((option, index) => [
      `option${index}`,
      { label: option.label, color: `var(--chart-${index + 1})` },
    ]),
  );
  const data = comparison.points.map((point) => {
    const row: Record<string, number | string | null> = { day: point.day };
    point.net_values.forEach((value, index) => {
      row[`option${index}`] = value === null ? null : toChartNumber(value);
      row[`label${index}`] = value === null ? null : formatBRL(value);
    });
    return row;
  });

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <LineChart data={data} margin={{ left: 4, right: 4 }}>
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
          width={64}
          domain={["auto", "auto"]}
          tickFormatter={(value: number) => axisCurrency.format(value)}
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
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${key})` }}
                      />
                      {config[key]?.label}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {options.map((_, index) => (
          <Line
            key={index}
            dataKey={`option${index}`}
            type="linear"
            stroke={`var(--color-option${index})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
