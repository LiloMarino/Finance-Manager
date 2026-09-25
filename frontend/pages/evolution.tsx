import { useState } from "react";

import { compositionHint } from "@/features/evolution/hints";
import { EvolutionChart } from "@/features/evolution/evolution-chart";
import { EvolutionSummary } from "@/features/evolution/evolution-summary";
import { useEvolution } from "@/features/evolution/use-evolution";
import { CategorySelect } from "@/shared/components/category-select";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { getApiErrorMessage } from "@/shared/lib/api";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

export function EvolutionPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "all" });
  const [composition, setComposition] = useState(false);
  const { data, isPending, error } = useEvolution({ category, ...periodRange(period) });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Evolução do patrimônio</h1>
        <p className="text-muted-foreground">
          O patrimônio no tempo, com os aportes dentro: para o quanto a carteira rendeu,
          veja a Rentabilidade.
        </p>
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-6">
            <EvolutionSummary evolution={data} />

            {/* Filtros */}
            <div className="flex flex-wrap items-end gap-3">
              <CategorySelect value={category} onChange={setCategory} />
              <PeriodSelect value={period} onChange={setPeriod} />
              <div className="flex items-center gap-2">
                <Switch
                  id="composition"
                  checked={composition}
                  onCheckedChange={setComposition}
                />
                <Label htmlFor="composition">
                  <MetricHint hint={compositionHint}>Composição</MetricHint>
                </Label>
              </div>
            </div>

            {/* Gráfico */}
            {data.points.length > 1 ? (
              <EvolutionChart points={data.points} composition={composition} />
            ) : (
              <p className="text-muted-foreground text-sm">Sem dados no período.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
