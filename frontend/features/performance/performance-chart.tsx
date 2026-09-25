import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";

import type { Performance } from "@/features/performance/use-performance";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { formatDate } from "@/shared/lib/format";
import { formatSignedPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  cumulative: { label: "Carteira", color: "var(--chart-1)" },
  ...benchmarkConfig,
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;

function isSeriesKey(value: string): value is SeriesKey {
  return value in chartConfig;
}

const axisPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
});

interface PerformanceChartProps {
  performance: Performance;
  selected: Benchmark[];
}

export function PerformanceChart({ performance, selected }: PerformanceChartProps) {
  const shown = performance.benchmarks.filter(
    (benchmark): benchmark is typeof benchmark & { series: Benchmark } =>
      selected.some((series) => series === benchmark.series) &&
      benchmark.points.length === performance.points.length,
  );

  // As referências têm um ponto em cada dia da carteira, na mesma ordem
  const data = performance.points.map((point, index) => {
    const row: Partial<Record<SeriesKey, number>> & {
      day: string;
      labels: Partial<Record<SeriesKey, string>>;
    } = {
      day: point.day,
      cumulative: toChartNumber(point.cumulative_return),
      labels: { cumulative: formatSignedPercent(point.cumulative_return) },
    };
    for (const benchmark of shown) {
      const value = benchmark.points[index]?.cumulative_return;
      if (value === undefined) continue;
      row[benchmark.series] = toChartNumber(value);
      row.labels[benchmark.series] = formatSignedPercent(value);
    }
    return row;
  });

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <ComposedChart data={data} margin={{ left: 4, right: 4 }}>
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
              formatter={(_, name, item) => {
                const key = String(name);
                const label: unknown = item.payload.labels?.[key];
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-[2px]"
                        style={{ backgroundColor: `var(--color-${key})` }}
                      />
                      {isSeriesKey(key) ? chartConfig[key].label : key}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        {shown.length > 0 && <ChartLegend content={<ChartLegendContent />} itemSorter={null} />}
        <Area
          dataKey="cumulative"
          type="monotone"
          stroke="var(--color-cumulative)"
          fill="var(--color-cumulative)"
          fillOpacity={0.15}
          strokeWidth={2}
          isAnimationActive={false}
        />
        {shown.map((benchmark) => (
          <Line
            key={benchmark.series}
            dataKey={benchmark.series}
            type="monotone"
            stroke={`var(--color-${benchmark.series})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ChartContainer>
  );
}
