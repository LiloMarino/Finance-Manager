import { useState } from "react";

import { compositionHint } from "@/features/evolution/hints";
import { EvolutionChart } from "@/features/evolution/evolution-chart";
import { EvolutionSummary } from "@/features/evolution/evolution-summary";
import { useEvolution } from "@/features/evolution/use-evolution";
import { CategorySelect } from "@/shared/components/category-select";
import { ChartLegend } from "@/shared/components/chart-legend";
import { MetricHint } from "@/shared/components/metric-hint";
import { Money } from "@/shared/components/money";
import { PageHeader } from "@/shared/components/page-header";
import { PeriodSelect } from "@/shared/components/period-select";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import { getApiErrorMessage } from "@/shared/lib/api";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";
import { signClass } from "@/shared/lib/sign";

export function EvolutionPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "all" });
  const [subportfolioId] = usePortfolioScope();
  const { data, isPending, error } = useEvolution({
    category,
    subportfolio_id: subportfolioId,
    ...periodRange(period),
  });
  const last = data?.points.at(-1);

  return (
    <>
      <PageHeader
        title="Evolução do patrimônio"
        description="O patrimônio no tempo, com os aportes dentro. Quanto a carteira rendeu, sem os aportes, está na Rentabilidade."
      >
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          <CategorySelect value={category} onChange={setCategory} />
          <PeriodSelect value={period} onChange={setPeriod} />
        </div>
      </PageHeader>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <>
          {/* Indicadores */}
          <EvolutionSummary evolution={data} />

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>
                <MetricHint hint={compositionHint}>Patrimônio e aplicado</MetricHint>
              </CardTitle>
              {last && (
                <CardAction>
                  <ChartLegend
                    entries={[
                      {
                        key: "value",
                        label: (
                          <span>
                            Patrimônio <Money value={last.value} />
                          </span>
                        ),
                        color: "var(--foreground)",
                        shape: "line",
                      },
                      {
                        key: "invested",
                        label: (
                          <span>
                            Aplicado <Money value={last.invested} />
                          </span>
                        ),
                        color: "var(--muted-foreground)",
                        shape: "dashed",
                      },
                    ]}
                  />
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data.points.length > 1 ? (
                <EvolutionChart points={data.points} />
              ) : (
                <p className="text-caption text-muted-foreground">Sem dados no período.</p>
              )}
              {last && (
                <p className="text-caption text-muted-foreground">
                  Ganho no fim do período:{" "}
                  <span className={signClass(last.gain)}>
                    <Money value={last.gain} signed />
                  </span>
                  . Aplicado é o que você colocou menos o que tirou; ganho é o patrimônio menos o
                  aplicado. Proventos recebidos saem da carteira e entram na Rentabilidade.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
