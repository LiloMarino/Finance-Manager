import { useState } from "react";

import { PortfolioCorrelation } from "@/features/correlation/portfolio-correlation";
import { CategorySelect } from "@/shared/components/category-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useSubportfolioParam } from "@/shared/hooks/use-subportfolio-param";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

export function RiskCorrelationPage() {
  const [category, setCategory] = useState<PortfolioCategory>();
  const [subportfolioId] = useSubportfolioParam();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Risco e correlação</h1>
          <p className="text-muted-foreground">
            O quanto os ativos da carteira andam juntos.
          </p>
        </div>
        <CategorySelect value={category} onChange={setCategory} />
      </div>

      {/* Correlação da carteira */}
      <Card>
        <CardHeader>
          <CardTitle>Correlação da carteira</CardTitle>
        </CardHeader>
        <CardContent>
          <PortfolioCorrelation category={category} subportfolioId={subportfolioId} />
        </CardContent>
      </Card>
    </div>
  );
}
