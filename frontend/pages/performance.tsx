import { useState } from "react";

import { PerformancePanel } from "@/features/performance/performance-panel";
import { CategorySelect } from "@/shared/components/category-select";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { PortfolioCategory } from "@/shared/lib/portfolio-category";

export function PerformancePage() {
  const [category, setCategory] = useState<PortfolioCategory>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Rentabilidade</h1>
        <p className="text-muted-foreground">
          Rentabilidade por cota: quanto a carteira rendeu, sem contar aportes e resgates.
        </p>
      </div>
      <Card>
        <CardContent>
          <PerformancePanel
            category={category}
            filters={<CategorySelect value={category} onChange={setCategory} />}
          />
        </CardContent>
      </Card>
    </div>
  );
}
