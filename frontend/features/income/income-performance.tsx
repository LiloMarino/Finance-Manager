import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { netHint, recentHint } from "@/features/income/hints";
import { type IncomePerformance, useIncomePerformance } from "@/features/income/use-income";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import { monthLabel } from "@/shared/lib/months";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import {
  isPortfolioCategory,
  portfolioCategoryConfig as categoryConfig,
  portfolioCategories,
} from "@/shared/lib/portfolio-category";
import { formatBRL, formatPercent, toChartNumber } from "@/types/decimal";

type Group = "month" | "year";

const axisMoney = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
});

/** `2024-03` vira "Mar/2024"; o ano fica como está. */
function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  return month ? monthLabel(Number(year), Number(month)) : period;
}

function Metric({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <MetricHint hint={hint}>
        <span className="text-muted-foreground text-sm">{label}</span>
      </MetricHint>
      <span className="text-xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function Summary({ performance }: { performance: IncomePerformance }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Metric
        label="Total recebido"
        hint={`Tudo o que já foi recebido, desde o primeiro provento. ${netHint}`}
        value={formatBRL(performance.total)}
      />
      <Metric label="6 meses" hint={recentHint(6)} value={formatBRL(performance.last_6_months)} />
      <Metric
        label="12 meses"
        hint={recentHint(12)}
        value={formatBRL(performance.last_12_months)}
      />
      <Metric
        label="24 meses"
        hint={recentHint(24)}
        value={formatBRL(performance.last_24_months)}
      />
    </div>
  );
}

function IncomeChart({ performance }: { performance: IncomePerformance }) {
  const present = new Set(
    performance.bars.flatMap((bar) => bar.categories.map((item) => item.category)),
  );
  // A ordem das categorias é fixa, e a cor segue a categoria
  const series = portfolioCategories.filter((category) => present.has(category));
  const data = performance.bars.map((bar) => ({
    label: periodLabel(bar.period),
    total: formatBRL(bar.total),
    labels: Object.fromEntries(
      bar.categories.map((item) => [item.category, formatBRL(item.amount)]),
    ),
    ...Object.fromEntries(
      bar.categories.map((item) => [item.category, toChartNumber(item.amount)]),
    ),
  }));

  if (series.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum provento no período.</p>;
  }

  return (
    <ChartContainer config={categoryConfig} className="aspect-auto h-72 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => axisMoney.format(value)}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              labelFormatter={(label, payload) => {
                const total: unknown = payload[0]?.payload?.total;
                return `${String(label)} · ${String(total)}`;
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
                      {isPortfolioCategory(key) ? categoryConfig[key].label : key}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId="income"
            fill={`var(--color-${category})`}
            stroke="var(--card)"
            strokeWidth={index === 0 ? 0 : 2}
            radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function CategoryTotals({ performance }: { performance: IncomePerformance }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Recebido no período</TableHead>
          <TableHead className="text-right">% do período</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {performance.categories.map((item) => (
          <TableRow key={item.category}>
            <TableCell>
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: categoryConfig[item.category].color }}
                />
                {categoryConfig[item.category].label}
              </span>
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatBRL(item.amount)}</TableCell>
            <TableCell className="text-right tabular-nums">
              {formatPercent(item.share)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="font-medium">Total</TableCell>
          <TableCell className="text-right font-medium tabular-nums">
            {formatBRL(performance.period_total)}
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function IncomePerformancePanel() {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const [group, setGroup] = useState<Group>("month");
  const { data, isPending, error } = useIncomePerformance({
    group,
    ...periodRange(period),
  });

  return (
    <div className="flex flex-col gap-6">
      {data && <Summary performance={data} />}

      <div className="flex flex-wrap items-end gap-3">
        <PeriodSelect value={period} onChange={setPeriod} />
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={group}
          onValueChange={(value) => {
            if (value === "month" || value === "year") setGroup(value);
          }}
        >
          <ToggleGroupItem value="month">Por mês</ToggleGroupItem>
          <ToggleGroupItem value="year">Por ano</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          <IncomeChart performance={data} />
          {data.categories.length > 0 && <CategoryTotals performance={data} />}
        </>
      )}
    </div>
  );
}
