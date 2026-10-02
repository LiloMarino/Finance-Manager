import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, XAxis, YAxis } from "recharts";

import { ColorSwatch } from "@/shared/components/color-swatch";
import { monthLabel } from "@/shared/lib/months";
import type { MonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { type DecimalString, formatSignedPercent, toChartNumber } from "@/types/decimal";

// A barra da carteira leva a cor do sinal do mês; a da referência, a cor dela
const chartConfig = {
  portfolio: { label: "Carteira", color: "var(--foreground)" },
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
    return <p className="text-caption text-muted-foreground">Sem meses no período.</p>;
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
        <ReferenceLine y={0} stroke="var(--border-strong)" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(_, name, item) => {
                const key = String(name);
                const label: unknown = item.payload.labels?.[key];
                return (
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="flex items-center gap-2">
                      <ColorSwatch
                        shape="square"
                        color={
                          key === "portfolio"
                            ? String(label).startsWith("-")
                              ? "var(--loss)"
                              : "var(--gain)"
                            : `var(--color-${key})`
                        }
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
        {series.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={2}
            isAnimationActive={false}
          >
            {key === "portfolio" &&
              rows.map((row) => (
                <Cell
                  key={row.key}
                  fill={row.values.portfolio?.startsWith("-") ? "var(--loss)" : "var(--gain)"}
                />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
