import { type ReactNode, useState } from "react";

import { benchmarksHint } from "@/features/performance/hints";
import { PerformanceChart } from "@/features/performance/performance-chart";
import { PerformanceSummary } from "@/features/performance/performance-summary";
import { type Performance, usePerformance } from "@/features/performance/use-performance";
import { ChartLegend } from "@/shared/components/chart-legend";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import { type Benchmark, benchmarkConfig, benchmarks, isBenchmark } from "@/shared/lib/benchmark";
import { formatDate } from "@/shared/lib/format";
import { type PeriodChoice, periodRange, periodTitle } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";
import { type DecimalString, formatSignedPercent } from "@/types/decimal";

interface PerformancePanelProps {
  category?: PortfolioCategory;
  assetId?: number;
  subportfolioId?: number;
  /** Filtros da tela, antes do seletor de período */
  filters?: ReactNode;
}

/** As referências escolhidas cujo último dado real é anterior ao fim do período. O
IPCA é datado no dia 1 do mês de referência, e por isso aparece pelo mês. */
function staleBenchmarks(performance: Performance, selected: Benchmark[]): string[] {
  const end = performance.end;
  return performance.benchmarks.flatMap(({ series, data_until: until }) => {
    if (!isBenchmark(series) || !selected.includes(series) || !until || !end) return [];
    const repeats = "depois disso, o último valor se repete.";
    if (series === "ipca") {
      return [`IPCA publicado até ${formatDate(until).slice(3)}; ${repeats}`];
    }
    const label = benchmarkConfig[series].label;
    return until < end ? [`${label} com dado até ${formatDate(until)}; ${repeats}`] : [];
  });
}

/** A legenda do gráfico com o resultado de cada linha no período. */
function legendEntries(performance: Performance, selected: Benchmark[]) {
  const percent = (value: DecimalString | null) => (value ? ` ${formatSignedPercent(value)}` : "");
  return [
    {
      key: "cumulative",
      label: `Carteira${percent(performance.period)}`,
      color: "var(--foreground)",
      shape: "line" as const,
    },
    ...performance.benchmarks.flatMap((benchmark) =>
      isBenchmark(benchmark.series) && selected.includes(benchmark.series)
        ? [
            {
              key: benchmark.series,
              label: `${benchmarkConfig[benchmark.series].label}${percent(benchmark.period)}`,
              color: benchmarkConfig[benchmark.series].color,
              shape: "dashed" as const,
            },
          ]
        : [],
    ),
  ];
}

/** A rentabilidade acumulada: filtros, indicadores do período e o gráfico contra as
referências. */
export function PerformancePanel({
  category,
  assetId,
  subportfolioId,
  filters,
}: PerformancePanelProps) {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const [selected, setSelected] = useState<Benchmark[]>([...benchmarks]);
  const { data, isPending, error } = usePerformance({
    category,
    asset_id: assetId,
    subportfolio_id: subportfolioId,
    ...periodRange(period),
  });

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        {filters}
        <PeriodSelect value={period} onChange={setPeriod} />
        <MetricHint hint={benchmarksHint}>
          <span className="text-caption text-muted-foreground ml-3">Comparar com</span>
        </MetricHint>
        <ToggleGroup
          multiple
          variant="segmented"
          size="sm"
          aria-label="Referências"
          value={selected}
          onValueChange={(values) => setSelected(values.filter(isBenchmark))}
        >
          {benchmarks.map((benchmark) => (
            <ToggleGroupItem key={benchmark} value={benchmark}>
              {benchmarkConfig[benchmark].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          {/* Indicadores */}
          <PerformanceSummary performance={data} periodLabel={periodTitle(period)} />

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Rentabilidade acumulada</CardTitle>
              <CardAction>
                <ChartLegend entries={legendEntries(data, selected)} />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.points.length > 1 ? (
                <PerformanceChart performance={data} selected={selected} />
              ) : (
                <p className="text-caption text-muted-foreground">Sem dados no período.</p>
              )}
              <div className="text-caption text-muted-foreground flex flex-col gap-1">
                <p>
                  {data.first_date && `Série desde ${formatDate(data.first_date)}. `}
                  Variação de preço mais os proventos, no dia do pagamento. Cada linha parte do zero
                  no início do período.
                </p>
                {staleBenchmarks(data, selected).map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
