import { useState } from "react";

import { BenchmarkSelect } from "@/features/monthly-returns/benchmark-select";
import { monthHint } from "@/features/monthly-returns/hints";
import {
  type Granularity,
  MonthlyReturnsChart,
} from "@/features/monthly-returns/monthly-returns-chart";
import { MonthlyReturnsSummary } from "@/features/monthly-returns/monthly-returns-summary";
import { MonthlyReturnsTable } from "@/features/monthly-returns/monthly-returns-table";
import { useMonthlyReturns } from "@/features/monthly-returns/use-monthly-returns";
import { CategorySelect } from "@/shared/components/category-select";
import { MetricHint } from "@/shared/components/metric-hint";
import { PeriodSelect } from "@/shared/components/period-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { getApiErrorMessage } from "@/shared/lib/api";
import type { Benchmark } from "@/shared/lib/benchmark";
import { type PeriodChoice, periodRange } from "@/shared/lib/period";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

const granularityLabels: Record<Granularity, string> = { month: "Por mês", year: "Por ano" };

function isGranularity(value: string): value is Granularity {
  return value in granularityLabels;
}

export function MonthlyReturnsPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [benchmark, setBenchmark] = useState<Benchmark>();
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [period, setPeriod] = useState<PeriodChoice>({ preset: "12m" });
  const { data, isPending, error } = useMonthlyReturns({ category });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Ano a ano</h1>
        <p className="text-muted-foreground">
          A rentabilidade por cota de cada mês e de cada ano, sem contar aportes e resgates.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <CategorySelect value={category} onChange={setCategory} />
        <BenchmarkSelect value={benchmark} onChange={setBenchmark} />
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <span className="text-destructive">{getApiErrorMessage(error)}</span>
      ) : data.years.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sem dados.</p>
      ) : (
        <>
          <MonthlyReturnsSummary monthly={data} />

          {/* Tabela mês × ano */}
          <Card>
            <CardHeader>
              <CardTitle>
                <MetricHint hint={monthHint}>Rentabilidade mês a mês</MetricHint>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyReturnsTable monthly={data} benchmark={benchmark} />
              <p className="text-muted-foreground mt-3 text-xs">
                Variação de preço mais os proventos, no mês do pagamento.
              </p>
            </CardContent>
          </Card>

          {/* Gráfico de barras */}
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  value={granularity}
                  onValueChange={(value) => {
                    if (isGranularity(value)) setGranularity(value);
                  }}
                >
                  {Object.entries(granularityLabels).map(([value, label]) => (
                    <ToggleGroupItem key={value} value={value}>
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {granularity === "month" && (
                  <PeriodSelect value={period} onChange={setPeriod} />
                )}
              </div>
              <MonthlyReturnsChart
                monthly={data}
                benchmark={benchmark}
                granularity={granularity}
                {...periodRange(period)}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
