import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";

import type { Performance } from "@/features/performance/use-performance";
import { ColorSwatch } from "@/shared/components/color-swatch";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { formatDate } from "@/shared/lib/format";
import { formatSignedPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  cumulative: { label: "Carteira", color: "var(--foreground)" },
  ...benchmarkConfig,
} satisfies ChartConfig;

type SeriesKey = keyof typeof chartConfig;

function isSeriesKey(value: string): value is SeriesKey {
  return value in chartConfig;
}

const axisPercent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

interface PerformanceChartProps {
  performance: Performance;
  selected: Benchmark[];
  /** O nome da linha principal no tooltip: a carteira ou o ativo. */
  label?: string;
}

/** A rentabilidade acumulada no período, com as referências escolhidas tracejadas;
todas partem do zero no início dele. */
export function PerformanceChart({ performance, selected, label }: PerformanceChartProps) {
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
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <ReferenceLine y={0} stroke="var(--border-strong)" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          minTickGap={48}
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
                const value: unknown = item.payload.labels?.[key];
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <ColorSwatch
                        shape={key === "cumulative" ? "line" : "dashed"}
                        color={`var(--color-${key})`}
                      />
                      {key === "cumulative" && label
                        ? label
                        : isSeriesKey(key)
                          ? chartConfig[key].label
                          : key}
                    </span>
                    <span className="tabular-nums">{String(value)}</span>
                  </span>
                );
              }}
            />
          }
        />
        {shown.map((benchmark) => (
          <Line
            key={benchmark.series}
            dataKey={benchmark.series}
            type="monotone"
            stroke={`var(--color-${benchmark.series})`}
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
          />
        ))}
        <Line
          dataKey="cumulative"
          type="monotone"
          stroke="var(--color-cumulative)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
