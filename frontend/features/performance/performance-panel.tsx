import { type ReactNode, useState } from "react";

import { PerformanceChart } from "@/features/performance/performance-chart";
import { PerformanceSummary } from "@/features/performance/performance-summary";
import { usePerformance } from "@/features/performance/use-performance";
import { PeriodSelect } from "@/shared/components/period-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getApiErrorMessage } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

interface PerformancePanelProps {
  category?: PortfolioCategory;
  assetId?: number;
  /** Filtros da tela, ao lado do seletor de período */
  filters?: ReactNode;
}

export function PerformancePanel({ category, assetId, filters }: PerformancePanelProps) {
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
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

      {/* Gráfico */}
      {isPending ? (
        <Skeleton className="h-72 w-full" />
      ) : data && data.points.length > 1 ? (
        <>
          <PerformanceChart points={data.points} />
          {data.first_date && (
            <p className="text-muted-foreground text-xs">
              Série desde {formatDate(data.first_date)}. Só a variação de preço: os
              proventos ainda não entram na rentabilidade.
            </p>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-sm">Sem dados no período.</p>
      )}
    </div>
  );
}
