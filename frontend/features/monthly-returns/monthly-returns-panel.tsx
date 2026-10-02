import { type ReactNode, useState } from "react";

import { BenchmarkSelect } from "@/features/monthly-returns/benchmark-select";
import { monthHint } from "@/features/monthly-returns/hints";
import {
  type Granularity,
  MonthlyReturnsChart,
} from "@/features/monthly-returns/monthly-returns-chart";
import { MonthlyReturnsSummary } from "@/features/monthly-returns/monthly-returns-summary";
import { MonthlyReturnsTable } from "@/features/monthly-returns/monthly-returns-table";
import { useMonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import { ChartLegend, type LegendEntry } from "@/shared/components/chart-legend";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import { type Benchmark, benchmarkConfig } from "@/shared/lib/benchmark";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

const granularityLabels: Record<Granularity, string> = { month: "Por mês", year: "Por ano" };

function isGranularity(value: string): value is Granularity {
  return value in granularityLabels;
}

interface MonthlyReturnsPanelProps {
  category?: PortfolioCategory;
  subportfolioId?: number;
  /** Filtros da tela, antes da referência */
  filters?: ReactNode;
}

/** A rentabilidade de cada mês e de cada ano: indicadores, a tabela mês × ano com a
referência embaixo de cada ano e as barras. */
export function MonthlyReturnsPanel({
  category,
  subportfolioId,
  filters,
}: MonthlyReturnsPanelProps) {
  const [benchmark, setBenchmark] = useState<Benchmark | undefined>("cdi");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const { data, isPending, error } = useMonthlyReturns({
    category,
    subportfolio_id: subportfolioId,
  });
  const legend: LegendEntry[] = [
    { key: "gain", label: "Carteira, alta", color: "var(--gain)", shape: "square" },
    { key: "loss", label: "Carteira, baixa", color: "var(--loss)", shape: "square" },
    ...(benchmark
      ? [
          {
            key: benchmark,
            label: benchmarkConfig[benchmark].label,
            color: benchmarkConfig[benchmark].color,
            shape: "square" as const,
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <span className="text-caption text-muted-foreground ml-3">Referência</span>
        <BenchmarkSelect value={benchmark} onChange={setBenchmark} />
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.years.length === 0 ? (
        <p className="text-caption text-muted-foreground">Sem dados.</p>
      ) : (
        <>
          {/* Indicadores */}
          <MonthlyReturnsSummary monthly={data} />

          {/* Tabela mês × ano */}
          <Card>
            <CardHeader>
              <CardTitle>
                <MetricHint hint={monthHint}>Mês a mês</MetricHint>
              </CardTitle>
              <CardAction>
                <CardDescription>
                  O ano mais recente no topo
                  {benchmark &&
                    `, com o ${benchmarkConfig[benchmark].label} do mesmo mês logo abaixo`}
                </CardDescription>
              </CardAction>
            </CardHeader>
            <CardContent data-flush>
              <MonthlyReturnsTable monthly={data} benchmark={benchmark} />
            </CardContent>
          </Card>

          {/* Barras */}
          <Card>
            <CardHeader>
              <CardTitle>{granularity === "month" ? "Cada mês do período" : "Cada ano"}</CardTitle>
              <CardAction className="flex flex-wrap items-center gap-3">
                <ChartLegend entries={legend} />
                <ToggleGroup
                  variant="segmented"
                  size="sm"
                  aria-label="Agrupar"
                  value={[granularity]}
                  onValueChange={([value]) => {
                    if (value && isGranularity(value)) setGranularity(value);
                  }}
                >
                  {Object.entries(granularityLabels).map(([value, label]) => (
                    <ToggleGroupItem key={value} value={value}>
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {granularity === "month" && <PeriodSelect value={period} onChange={setPeriod} />}
              <MonthlyReturnsChart
                monthly={data}
                benchmark={benchmark}
                granularity={granularity}
                {...periodRange(period)}
              />
              <p className="text-caption text-muted-foreground">
                Variação de preço mais os proventos, no mês do pagamento.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
