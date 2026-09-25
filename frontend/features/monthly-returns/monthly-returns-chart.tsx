import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { monthLabel } from "@/features/monthly-returns/months";
import type { MonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { type DecimalString, formatSignedPercent, toChartNumber } from "@/types/decimal";

const chartConfig = {
  portfolio: { label: "Carteira", color: "var(--chart-1)" },
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

export type Granularity = "month" | "year";

interface Row {
  key: string;
  label: string;
  values: Partial<Record<SeriesKey, DecimalString>>;
}

/** Um mês entra quando o dia 1 dele cai dentro do intervalo: o mês é contado
inteiro, de fechamento a fechamento. */
function inRange(key: string, start: string | undefined, end: string | undefined): boolean {
  const first = `${key}-01`;
  return (!start || first >= start) && (!end || first <= end);
}

function monthRows(
  monthly: MonthlyReturns,
  benchmark: Benchmark | undefined,
  start: string | undefined,
  end: string | undefined,
): Row[] {
  const reference = monthly.benchmarks.find((found) => found.series === benchmark);
  const referenceYears = new Map(reference?.years.map((found) => [found.year, found]));
  return monthly.years.flatMap((found) =>
    found.months.flatMap((value, index) => {
      const key = `${found.year}-${String(index + 1).padStart(2, "0")}`;
      if (value === null || !inRange(key, start, end)) return [];
      const label = monthLabel(found.year, index + 1);
      const row: Row = { key, label, values: { portfolio: value } };
      const referenceValue = referenceYears.get(found.year)?.months[index];
      if (benchmark && referenceValue) row.values[benchmark] = referenceValue;
      return [row];
    }),
  );
}

function yearRows(monthly: MonthlyReturns, benchmark: Benchmark | undefined): Row[] {
  const reference = monthly.benchmarks.find((found) => found.series === benchmark);
  const referenceYears = new Map(reference?.years.map((found) => [found.year, found]));
  return monthly.years.map((found) => {
    const row: Row = {
      key: String(found.year),
      label: String(found.year),
      values: { portfolio: found.year_return },
    };
    const referenceValue = referenceYears.get(found.year)?.year_return;
    if (benchmark && referenceValue) row.values[benchmark] = referenceValue;
    return row;
  });
}

interface MonthlyReturnsChartProps {
  monthly: MonthlyReturns;
  benchmark: Benchmark | undefined;
  granularity: Granularity;
  start?: string;
  end?: string;
}

export function MonthlyReturnsChart({
  monthly,
  benchmark,
  granularity,
  start,
  end,
}: MonthlyReturnsChartProps) {
  const rows =
    granularity === "month"
      ? monthRows(monthly, benchmark, start, end)
      : yearRows(monthly, benchmark);
  const series: SeriesKey[] = benchmark ? ["portfolio", benchmark] : ["portfolio"];
  const data = rows.map((row) => ({
    label: row.label,
    labels: Object.fromEntries(
      Object.entries(row.values).map(([key, value]) => [key, formatSignedPercent(value)]),
    ),
    ...Object.fromEntries(
      Object.entries(row.values).map(([key, value]) => [key, toChartNumber(value)]),
    ),
  }));

  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">Sem meses no período.</p>;
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(value: number) => axisPercent.format(value)}
        />
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          content={
            <ChartTooltipContent
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
        {benchmark && <ChartLegend content={<ChartLegendContent />} itemSorter={null} />}
        {series.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={2}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
