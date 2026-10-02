import { type ReactNode, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { netHint } from "@/features/income/hints";
import { type IncomePerformance, useIncomePerformance } from "@/features/income/use-income";
import { ChartLegend } from "@/shared/components/chart-legend";
import { ColorSwatch } from "@/shared/components/color-swatch";
import { Metric, MetricStrip } from "@/shared/components/metric";
import { Money } from "@/shared/components/money";
import { PeriodSelect } from "@/shared/components/period-select";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/shared/components/ui/chart";
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
import { useValueFormat } from "@/shared/hooks/use-value-format";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { monthLabel } from "@/shared/lib/months";
import { type PeriodChoice, periodRange, periodTitle } from "@/shared/lib/period";
import {
  type PortfolioCategory,
  isPortfolioCategory,
  portfolioCategoryConfig as categoryConfig,
  portfolioCategories,
} from "@/shared/lib/portfolio-category";
import { formatPercent, toChartNumber } from "@/types/decimal";

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

function Summary({ performance, title }: { performance: IncomePerformance; title: string }) {
  const first = performance.bars[0]?.period;
  const last = performance.bars.at(-1)?.period;
  const range = first && last ? `, de ${periodLabel(first)} a ${periodLabel(last)}` : "";
  return (
    <MetricStrip>
      <Metric
        label={`Recebido ${title.toLowerCase()}`}
        hint={netHint}
        size="lg"
        value={<Money value={performance.period_total} />}
        detail={`${performance.payments} ${performance.payments === 1 ? "pagamento" : "pagamentos"}${range}`}
      />
      <Metric
        label="Média por mês"
        size="lg"
        value={performance.monthly_average && <Money value={performance.monthly_average} />}
        detail="contando os meses sem provento"
      />
      <Metric
        label="Desde o início"
        size="lg"
        value={<Money value={performance.total} />}
        detail={performance.first_payment && `desde ${formatDate(performance.first_payment)}`}
      />
    </MetricStrip>
  );
}

function IncomeChart({ performance }: { performance: IncomePerformance }) {
  const format = useValueFormat();
  const present = new Set(
    performance.bars.flatMap((bar) => bar.categories.map((item) => item.category)),
  );
  // A ordem das categorias é fixa, e a cor segue a categoria
  const series = portfolioCategories.filter((category) => present.has(category));
  const data = performance.bars.map((bar) => ({
    label: periodLabel(bar.period),
    total: format.brl(bar.total),
    labels: Object.fromEntries(
      bar.categories.map((item) => [item.category, format.brl(item.amount)]),
    ),
    ...Object.fromEntries(
      bar.categories.map((item) => [item.category, toChartNumber(item.amount)]),
    ),
  }));

  if (series.length === 0) {
    return <p className="text-caption text-muted-foreground">Nenhum provento no período.</p>;
  }

  return (
    <ChartContainer config={categoryConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(value: number) => format.amount(axisMoney.format(value))}
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
                      <ColorSwatch shape="square" color={`var(--color-${key})`} />
                      {isPortfolioCategory(key) ? categoryConfig[key].label : key}
                    </span>
                    <span className="tabular-nums">{String(label)}</span>
                  </span>
                );
              }}
            />
          }
        />
        {series.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId="income"
            fill={`var(--color-${category})`}
            stroke="var(--card)"
            strokeWidth={index === 0 ? 0 : 2}
            radius={index === series.length - 1 ? [3, 3, 0, 0] : 0}
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
          <TableHead className="text-right">Recebido</TableHead>
          <TableHead className="text-right">%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {performance.categories.map((item) => (
          <TableRow key={item.category}>
            <TableCell>
              <span className="flex items-center gap-2">
                <ColorSwatch color={categoryConfig[item.category].color} />
                {categoryConfig[item.category].label}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Money value={item.amount} />
            </TableCell>
            <TableCell variant="muted" className="text-right">
              {formatPercent(item.share)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow variant="total">
          <TableCell>Total</TableCell>
          <TableCell className="text-right">
            <Money value={performance.period_total} />
          </TableCell>
          <TableCell className="text-right">100,00%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

interface IncomePerformancePanelProps {
  subportfolioId?: number;
  category?: PortfolioCategory;
  /** Filtros da tela, antes do período */
  filters?: ReactNode;
}

/** O recebido no período: indicadores, as barras por categoria e a tabela ao lado. */
export function IncomePerformancePanel({
  subportfolioId,
  category,
  filters,
}: IncomePerformancePanelProps) {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const [group, setGroup] = useState<Group>("month");
  const { data, isPending, error } = useIncomePerformance({
    group,
    category,
    subportfolio_id: subportfolioId,
    ...periodRange(period),
  });
  const legend = (data?.categories ?? []).map((item) => ({
    key: item.category,
    label: categoryConfig[item.category].label,
    color: categoryConfig[item.category].color,
    shape: "square" as const,
  }));

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <PeriodSelect value={period} onChange={setPeriod} />
        <ToggleGroup
          variant="segmented"
          size="sm"
          aria-label="Agrupar"
          value={[group]}
          onValueChange={([value]) => {
            if (value === "month" || value === "year") setGroup(value);
          }}
        >
          <ToggleGroupItem value="month">Por mês</ToggleGroupItem>
          <ToggleGroupItem value="year">Por ano</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          {/* Indicadores */}
          <Summary performance={data} title={periodTitle(period)} />

          {/* Barras e totais */}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                <CardTitle>{group === "month" ? "Por mês" : "Por ano"}</CardTitle>
                <CardAction>
                  <ChartLegend entries={legend} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <IncomeChart performance={data} />
              </CardContent>
            </Card>
            {data.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No período</CardTitle>
                </CardHeader>
                <CardContent data-flush>
                  <CategoryTotals performance={data} />
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
