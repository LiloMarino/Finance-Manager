import { useState } from "react";

import { PortfolioCorrelation } from "@/features/correlation/portfolio-correlation";
import { portfolioMatrixHint } from "@/features/correlation/hints";
import { chartHint } from "@/features/risk-return/hints";
import { RiskReturnPanel } from "@/features/risk-return/risk-return-panel";
import { MetricHint } from "@/shared/components/metric-hint";
import { CategorySelect } from "@/shared/components/category-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { usePortfolioScope } from "@/shared/hooks/use-portfolio-scope";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

export function RiskCorrelationPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [subportfolioId] = usePortfolioScope();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Risco e correlação</h1>
          <p className="text-muted-foreground">
            O quanto cada ativo oscila, o quanto rendeu, e o quanto eles andam juntos.
          </p>
        </div>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      {/* Risco × retorno */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MetricHint hint={chartHint}>Risco × retorno</MetricHint>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskReturnPanel category={category} subportfolioId={subportfolioId} />
        </CardContent>
      </Card>

      {/* Correlação da carteira */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MetricHint hint={portfolioMatrixHint}>Correlação da carteira</MetricHint>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioCorrelation category={category} subportfolioId={subportfolioId} />
        </CardContent>
      </Card>
    </div>
  );
}
