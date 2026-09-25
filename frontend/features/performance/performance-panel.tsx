import { type ReactNode, useState } from "react";

import { benchmarksHint } from "@/features/performance/hints";
import { PerformanceChart } from "@/features/performance/performance-chart";
import { PerformanceSummary } from "@/features/performance/performance-summary";
import { type Performance, usePerformance } from "@/features/performance/use-performance";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import {
  type Benchmark,
  benchmarkConfig,
  benchmarks,
  isBenchmark,
} from "@/shared/lib/benchmark";
import { formatDate } from "@/shared/lib/format";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

interface PerformancePanelProps {
  category?: PortfolioCategory;
  assetId?: number;
  /** Filtros da tela, ao lado do seletor de período */
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

export function PerformancePanel({ category, assetId, filters }: PerformancePanelProps) {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const [selected, setSelected] = useState<Benchmark[]>(["cdi"]);
  const { data, isPending, error } = usePerformance({
    category,
    asset_id: assetId,
    ...periodRange(period),
  });

  return (
    <div className="flex flex-col gap-4">
      {isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <PerformanceSummary performance={data} />
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        {filters}
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {/* Referências */}
      <div className="flex flex-wrap items-center gap-3">
        <MetricHint hint={benchmarksHint}>
          <span className="text-muted-foreground text-sm">Comparar com</span>
        </MetricHint>
        <ToggleGroup
          type="multiple"
          variant="outline"
          spacing={0}
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

      {/* Gráfico */}
      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : data && data.points.length > 1 ? (
        <>
          <PerformanceChart performance={data} selected={selected} />
          <div className="text-muted-foreground flex flex-col gap-1 text-xs">
            {data.first_date && (
              <p>
                Série desde {formatDate(data.first_date)}. Variação de preço mais os
                proventos, no dia do pagamento.
              </p>
            )}
            {staleBenchmarks(data, selected).map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Sem dados no período.</p>
      )}
    </div>
  );
}
